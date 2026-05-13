<?php
/**
 * DNS Setup Instructions Page
 * 
 * Displays DNS configuration instructions for custom domain setup.
 * Shows step-by-step guide for popular registrars and DNS verification status.
 */

// Get domain and submission info from request
$customDomain = $_GET['domain'] ?? '';
$submissionId = $_GET['submission_id'] ?? '';
$email = $_GET['email'] ?? '';

if (!$customDomain || !$submissionId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing domain or submission_id']);
    exit;
}

$targetIP = '216.128.140.207';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DNS Setup - <?php echo htmlspecialchars($customDomain); ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f1f5f9;
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #a78bfa;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #a78bfa, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .domain-badge {
            display: inline-block;
            background: #1e293b;
            border: 1px solid #475569;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-family: monospace;
            margin: 1rem 0;
            color: #cbd5e1;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 1rem;
        }
        
        .status-badge.pending {
            background: #f59e0b;
            color: #111;
        }
        
        .status-badge.verified {
            background: #10b981;
            color: #fff;
        }
        
        .section {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .section h2::before {
            content: '▸';
            color: #a78bfa;
            font-size: 1.25rem;
        }
        
        .dns-record {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 1rem 0;
            font-family: monospace;
        }
        
        .dns-record-row {
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 1rem;
            margin-bottom: 0.75rem;
        }
        
        .dns-record-row:last-child {
            margin-bottom: 0;
        }
        
        .dns-label {
            color: #a78bfa;
            font-weight: 600;
        }
        
        .dns-value {
            color: #cbd5e1;
            word-break: break-all;
        }
        
        .copy-btn {
            background: #334155;
            color: #e2e8f0;
            border: none;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.75rem;
            margin-left: 0.5rem;
            transition: background 0.2s;
        }
        
        .copy-btn:hover {
            background: #475569;
        }
        
        .registrar-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .registrar-tab {
            background: #334155;
            border: none;
            color: #cbd5e1;
            padding: 0.75rem 1.25rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
        }
        
        .registrar-tab:hover {
            background: #475569;
        }
        
        .registrar-tab.active {
            background: #a78bfa;
            color: #fff;
        }
        
        .registrar-content {
            display: none;
            animation: fadeIn 0.3s;
        }
        
        .registrar-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .step-list {
            list-style: none;
        }
        
        .step-list li {
            background: #0f172a;
            border-left: 3px solid #a78bfa;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.25rem;
        }
        
        .step-list strong {
            color: #a78bfa;
        }
        
        .timeline {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        
        .timeline p {
            color: #cbd5e1;
            margin-bottom: 0.75rem;
        }
        
        .timeline strong {
            color: #10b981;
        }
        
        .verify-button {
            background: linear-gradient(135deg, #a78bfa, #ec4899);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(167, 139, 250, 0.3);
        }
        
        .verify-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .verification-status {
            margin-top: 2rem;
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;
        }
        
        .verification-status.checking {
            background: #1e293b;
            border: 1px solid #334155;
        }
        
        .verification-status.success {
            background: #065f46;
            border: 1px solid #10b981;
        }
        
        .verification-status.error {
            background: #7c2d12;
            border: 1px solid #ea580c;
        }
        
        .verification-status p {
            margin: 0;
        }
        
        .info-box {
            background: #1e3a8a;
            border: 1px solid #3b82f6;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 1.5rem 0;
            color: #dbeafe;
        }
        
        .info-box strong {
            color: #93c5fd;
        }
        
        footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #334155;
            color: #64748b;
        }
        
        footer a {
            color: #a78bfa;
            text-decoration: none;
        }
        
        footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">Certxa</div>
            <h1>DNS Setup Instructions</h1>
            <div class="domain-badge"><?php echo htmlspecialchars($customDomain); ?></div>
            <div class="status-badge pending" id="statusBadge">Pending Verification</div>
        </header>

        <!-- A Record Instructions -->
        <section class="section">
            <h2>DNS A Record Configuration</h2>
            <p style="margin-bottom: 1.5rem; color: #cbd5e1;">
                Add the following DNS A record to your domain registrar's DNS settings:
            </p>
            
            <div class="dns-record">
                <div class="dns-record-row">
                    <div class="dns-label">Name:</div>
                    <div class="dns-value">
                        @ (or leave blank)
                        <button class="copy-btn" onclick="copyToClipboard('@')">Copy</button>
                    </div>
                </div>
                <div class="dns-record-row">
                    <div class="dns-label">Type:</div>
                    <div class="dns-value">A</div>
                </div>
                <div class="dns-record-row">
                    <div class="dns-label">Value/Target:</div>
                    <div class="dns-value">
                        <?php echo $targetIP; ?>
                        <button class="copy-btn" onclick="copyToClipboard('<?php echo $targetIP; ?>')">Copy</button>
                    </div>
                </div>
                <div class="dns-record-row">
                    <div class="dns-label">TTL:</div>
                    <div class="dns-value">3600 (or default)</div>
                </div>
            </div>
        </section>

        <!-- Registrar-Specific Instructions -->
        <section class="section">
            <h2>Setup by Registrar</h2>
            
            <div class="registrar-tabs">
                <button class="registrar-tab active" onclick="showRegistrar('godaddy')">GoDaddy</button>
                <button class="registrar-tab" onclick="showRegistrar('namecheap')">Namecheap</button>
                <button class="registrar-tab" onclick="showRegistrar('1and1')">1&1 / IONOS</button>
                <button class="registrar-tab" onclick="showRegistrar('cloudflare')">Cloudflare</button>
                <button class="registrar-tab" onclick="showRegistrar('route53')">AWS Route 53</button>
            </div>

            <!-- GoDaddy -->
            <div class="registrar-content active" id="godaddy-content">
                <ol class="step-list">
                    <li><strong>Log in</strong> to your GoDaddy account and navigate to your domains list</li>
                    <li><strong>Select</strong> the domain you want to configure</li>
                    <li><strong>Click</strong> "Manage DNS" for your domain</li>
                    <li><strong>Find</strong> the "A" record (or create a new one if it doesn't exist)</li>
                    <li><strong>Edit</strong> the A record to point to: <code><?php echo $targetIP; ?></code></li>
                    <li><strong>Save</strong> the changes (DNS propagation may take 24-48 hours)</li>
                </ol>
            </div>

            <!-- Namecheap -->
            <div class="registrar-content" id="namecheap-content">
                <ol class="step-list">
                    <li><strong>Log in</strong> to your Namecheap account</li>
                    <li><strong>Go to</strong> "Account" → "Manage Domains"</li>
                    <li><strong>Click</strong> on your domain name</li>
                    <li><strong>Go to</strong> the "Advanced DNS" tab</li>
                    <li><strong>Edit</strong> or create an A record with:
                        <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: #cbd5e1;">
                            <li>Type: A</li>
                            <li>Host: @ (or www depending on your setup)</li>
                            <li>Value: <?php echo $targetIP; ?></li>
                            <li>TTL: 3600</li>
                        </ul>
                    </li>
                    <li><strong>Save</strong> the DNS records</li>
                </ol>
            </div>

            <!-- 1&1 / IONOS -->
            <div class="registrar-content" id="1and1-content">
                <ol class="step-list">
                    <li><strong>Log in</strong> to your 1&1 / IONOS control panel</li>
                    <li><strong>Navigate to</strong> your domain settings</li>
                    <li><strong>Find</strong> the "DNS" or "Nameservers" section</li>
                    <li><strong>Look for</strong> DNS record management (might be labeled "A records")</li>
                    <li><strong>Create or edit</strong> the A record:
                        <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: #cbd5e1;">
                            <li>Type: A</li>
                            <li>Subdomain: @ (leave blank for root)</li>
                            <li>Points to: <?php echo $targetIP; ?></li>
                        </ul>
                    </li>
                    <li><strong>Save</strong> your changes</li>
                </ol>
            </div>

            <!-- Cloudflare -->
            <div class="registrar-content" id="cloudflare-content">
                <ol class="step-list">
                    <li><strong>Log in</strong> to your Cloudflare account</li>
                    <li><strong>Select</strong> your domain from the list</li>
                    <li><strong>Go to</strong> the "DNS" tab in the left sidebar</li>
                    <li><strong>Click</strong> "Add record"</li>
                    <li><strong>Configure</strong> the A record:
                        <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: #cbd5e1;">
                            <li>Type: A</li>
                            <li>Name: @ (or leave as default root domain)</li>
                            <li>IPv4 Address: <?php echo $targetIP; ?></li>
                            <li>TTL: Auto (or 3600)</li>
                        </ul>
                    </li>
                    <li><strong>Click</strong> "Save"</li>
                    <li>Ensure the record is set to "DNS only" (orange cloud icon)</li>
                </ol>
            </div>

            <!-- AWS Route 53 -->
            <div class="registrar-content" id="route53-content">
                <ol class="step-list">
                    <li><strong>Log in</strong> to your AWS Management Console</li>
                    <li><strong>Navigate to</strong> Route 53 service</li>
                    <li><strong>Click</strong> "Hosted zones" and select your domain</li>
                    <li><strong>Click</strong> "Create record"</li>
                    <li><strong>Configure</strong> the A record:
                        <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: #cbd5e1;">
                            <li>Record type: A</li>
                            <li>Record name: Leave blank (for root domain) or enter subdomain</li>
                            <li>Value: <?php echo $targetIP; ?></li>
                            <li>TTL: 3600 (default)</li>
                        </ul>
                    </li>
                    <li><strong>Click</strong> "Create records"</li>
                </ol>
            </div>
        </section>

        <!-- Timeline Information -->
        <section class="section">
            <h2>DNS Propagation Timeline</h2>
            <div class="timeline">
                <p><strong>⏱ Typical Time: 24-48 hours</strong></p>
                <p>DNS changes don't happen instantly. Your domain registrar needs time to update their nameservers, and then the changes need to propagate across the internet's DNS servers worldwide.</p>
                <p><strong>What to expect:</strong></p>
                <ul style="margin-left: 1.5rem; margin-top: 0.75rem;">
                    <li>Some visitors may see your site immediately</li>
                    <li>Others may see the old configuration for up to 48 hours</li>
                    <li>After 48 hours, everyone should see your new site</li>
                </ul>
            </div>
        </section>

        <!-- Verification Section -->
        <section class="section">
            <h2>Verify Your Domain</h2>
            <p style="margin-bottom: 1rem; color: #cbd5e1;">
                Once you've added the DNS A record, click the button below to verify it.
            </p>
            
            <div id="verificationStatus"></div>
            
            <button class="verify-button" id="verifyBtn" onclick="verifyDomain()">
                🔍 Verify DNS Record
            </button>
            
            <div class="info-box">
                <strong>ℹ️ Tip:</strong> If verification fails, wait a few minutes and try again. DNS changes take time to propagate.
            </div>
        </section>

        <footer>
            <p>Need help? <a href="https://certxa.com/support">Contact our support team</a></p>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #475569;">
                Submission ID: <?php echo htmlspecialchars($submissionId); ?>
            </p>
        </footer>
    </div>

    <script>
        const customDomain = '<?php echo htmlspecialchars($customDomain); ?>';
        const submissionId = '<?php echo htmlspecialchars($submissionId); ?>';
        const email = '<?php echo htmlspecialchars($email); ?>';

        function showRegistrar(registrar) {
            // Hide all content
            document.querySelectorAll('.registrar-content').forEach(el => {
                el.classList.remove('active');
            });
            document.querySelectorAll('.registrar-tab').forEach(el => {
                el.classList.remove('active');
            });

            // Show selected
            document.getElementById(registrar + '-content').classList.add('active');
            event.target.classList.add('active');
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }

        async function verifyDomain() {
            const btn = document.getElementById('verifyBtn');
            const statusDiv = document.getElementById('verificationStatus');

            btn.disabled = true;
            btn.textContent = '⏳ Verifying...';

            statusDiv.innerHTML = `
                <div class="verification-status checking">
                    <p>Checking DNS records for ${customDomain}...</p>
                </div>
            `;

            try {
                const response = await fetch('/api/verify-domain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        submission_id: submissionId,
                        domain: customDomain,
                        email: email || undefined
                    })
                });

                const data = await response.json();

                if (data.verified) {
                    statusDiv.innerHTML = `
                        <div class="verification-status success">
                            <p>✓ ${data.message}</p>
                        </div>
                    `;
                    document.getElementById('statusBadge').textContent = 'Verified ✓';
                    document.getElementById('statusBadge').className = 'status-badge verified';
                    btn.textContent = '✓ Verified';
                } else {
                    statusDiv.innerHTML = `
                        <div class="verification-status error">
                            <p>✗ ${data.message}</p>
                        </div>
                    `;
                    btn.disabled = false;
                    btn.textContent = '🔄 Try Again';
                }
            } catch (error) {
                statusDiv.innerHTML = `
                    <div class="verification-status error">
                        <p>✗ Verification error: ${error.message}</p>
                    </div>
                `;
                btn.disabled = false;
                btn.textContent = '🔄 Try Again';
            }
        }
    </script>
</body>
</html>
