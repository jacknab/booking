import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSelectedStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatInTz } from "@/lib/timezone";
import type { CashDrawerSessionWithActions } from "@shared/schema";
import {
  DollarSign, Lock, Unlock, FileText, Clock, ArrowDownCircle,
  ArrowUpCircle, Banknote, CreditCard, Smartphone, Printer,
  AlertTriangle, Check, ChevronDown, ChevronRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CashDrawer() {
  const { selectedStore } = useSelectedStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const timezone = selectedStore?.timezone || "UTC";
  const userName = user?.firstName || user?.email || "Staff";

  const [openingAmount, setOpeningAmount] = useState("0.00");
  const [closingAmount, setClosingAmount] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [actionType, setActionType] = useState<"cash_in" | "cash_out" | null>(null);
  const [actionAmount, setActionAmount] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [viewingReportId, setViewingReportId] = useState<number | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  const { data: openSession, isLoading: loadingOpen } = useQuery<CashDrawerSessionWithActions | null>({
    queryKey: [`/api/cash-drawer/open?storeId=${selectedStore?.id}`],
    enabled: !!selectedStore,
  });

  const { data: sessions = [] } = useQuery<CashDrawerSessionWithActions[]>({
    queryKey: [`/api/cash-drawer/sessions?storeId=${selectedStore?.id}`],
    enabled: !!selectedStore,
  });

  const { data: zReport } = useQuery({
    queryKey: [`/api/cash-drawer/sessions/${viewingReportId}/z-report`],
    enabled: !!viewingReportId,
  });

  const invalidateDrawerQueries = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/cash-drawer/open?storeId=${selectedStore?.id}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/cash-drawer/sessions?storeId=${selectedStore?.id}`] });
  };

  const openDrawerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cash-drawer/sessions", {
        storeId: selectedStore!.id,
        openingBalance: openingAmount,
        openedBy: userName,
      });
    },
    onSuccess: () => {
      invalidateDrawerQueries();
      toast({ title: "Drawer opened", description: "Cash drawer session started." });
      setOpeningAmount("0.00");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not open drawer", variant: "destructive" });
    },
  });

  const closeDrawerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/cash-drawer/sessions/${openSession!.id}/close`, {
        closingBalance: closingAmount,
        closedBy: userName,
        notes: closeNotes,
      });
    },
    onSuccess: () => {
      invalidateDrawerQueries();
      toast({ title: "Shift closed", description: "Day close completed. Z Report generated." });
      setShowCloseDialog(false);
      setClosingAmount("");
      setCloseNotes("");
      setViewingReportId(openSession!.id);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not close drawer", variant: "destructive" });
    },
  });

  const drawerActionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/cash-drawer/sessions/${openSession!.id}/action`, {
        type: actionType,
        amount: actionAmount,
        reason: actionReason,
        performedBy: userName,
      });
    },
    onSuccess: () => {
      invalidateDrawerQueries();
      toast({ title: actionType === "cash_in" ? "Cash In recorded" : "Cash Out recorded" });
      setActionType(null);
      setActionAmount("");
      setActionReason("");
    },
  });

  const openDrawerKickMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/cash-drawer/sessions/${openSession!.id}/action`, {
        type: "open_drawer",
        reason: "Manual drawer open",
        performedBy: userName,
      });
    },
    onSuccess: () => {
      invalidateDrawerQueries();
      toast({ title: "Drawer opened", description: "Cash drawer kick signal sent." });
    },
  });

  const closedSessions = sessions.filter(s => s.status === "closed");

  if (loadingOpen) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="page-title">Cash Drawer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your cash drawer, record cash movements, and generate Z reports
            </p>
          </div>
          {openSession && (
            <Badge variant="outline" className="no-default-active-elevate text-green-600 border-green-300 gap-1.5">
              <Unlock className="w-3.5 h-3.5" />
              Drawer Open
            </Badge>
          )}
        </div>

        {!openSession ? (
          <Card data-testid="open-drawer-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-muted-foreground" />
                Start a New Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Open the cash drawer to begin accepting payments. Enter the starting cash amount in the drawer.
              </p>
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Opening Balance</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      className="pl-9 w-40"
                      data-testid="input-opening-balance"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => openDrawerMutation.mutate()}
                  disabled={openDrawerMutation.isPending}
                  className="bg-green-600 text-white gap-2"
                  data-testid="button-open-drawer"
                >
                  <Unlock className="w-4 h-4" />
                  {openDrawerMutation.isPending ? "Opening..." : "Open Drawer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card data-testid="active-session-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Session</p>
                    <p className="text-xs text-muted-foreground">
                      Opened {formatInTz(openSession.openedAt, timezone, "MMM d, yyyy 'at' h:mm a")}
                      {openSession.openedBy && ` by ${openSession.openedBy}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Opening balance: ${Number(openSession.openingBalance).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => openDrawerKickMutation.mutate()}
                      disabled={openDrawerKickMutation.isPending}
                      data-testid="button-kick-drawer"
                    >
                      <Banknote className="w-4 h-4" />
                      Open Drawer
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setActionType("cash_in")}
                      data-testid="button-cash-in"
                    >
                      <ArrowDownCircle className="w-4 h-4 text-green-600" />
                      Cash In
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setActionType("cash_out")}
                      data-testid="button-cash-out"
                    >
                      <ArrowUpCircle className="w-4 h-4 text-destructive" />
                      Cash Out
                    </Button>
                    <Button
                      className="gap-2 bg-destructive text-destructive-foreground"
                      onClick={() => setShowCloseDialog(true)}
                      data-testid="button-end-shift"
                    >
                      <Lock className="w-4 h-4" />
                      End Shift
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {actionType && (
              <Card data-testid="cash-action-card">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium flex items-center gap-2">
                      {actionType === "cash_in" ? (
                        <><ArrowDownCircle className="w-4 h-4 text-green-600" /> Cash In (Paid In)</>
                      ) : (
                        <><ArrowUpCircle className="w-4 h-4 text-destructive" /> Cash Out (Paid Out)</>
                      )}
                    </h3>
                    <Button size="icon" variant="ghost" onClick={() => setActionType(null)} data-testid="button-cancel-action">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={actionAmount}
                          onChange={(e) => setActionAmount(e.target.value)}
                          className="pl-9 w-40"
                          data-testid="input-action-amount"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground">Reason</label>
                      <Input
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="e.g. Change for register, tip payout..."
                        data-testid="input-action-reason"
                      />
                    </div>
                    <Button
                      onClick={() => drawerActionMutation.mutate()}
                      disabled={!actionAmount || Number(actionAmount) <= 0 || drawerActionMutation.isPending}
                      data-testid="button-submit-action"
                    >
                      {drawerActionMutation.isPending ? "Saving..." : "Record"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {openSession.actions && openSession.actions.length > 0 && (
              <Card data-testid="session-actions-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Session Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {openSession.actions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" data-testid={`action-${action.id}`}>
                        <div className="flex items-center gap-2">
                          {action.type === "open_drawer" && <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
                          {action.type === "cash_in" && <ArrowDownCircle className="w-3.5 h-3.5 text-green-600" />}
                          {action.type === "cash_out" && <ArrowUpCircle className="w-3.5 h-3.5 text-destructive" />}
                          {action.type === "close_drawer" && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                          <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                          {action.reason && <span className="text-muted-foreground">- {action.reason}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          {action.amount && <span className={cn("font-medium", action.type === "cash_in" ? "text-green-600" : action.type === "cash_out" ? "text-destructive" : "")}>
                            {action.type === "cash_out" ? "-" : ""}${Number(action.amount).toFixed(2)}
                          </span>}
                          <span className="text-xs text-muted-foreground">
                            {formatInTz(action.performedAt, timezone, "h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {showCloseDialog && (
              <Card className="border-destructive/30" data-testid="close-dialog-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    End Shift / Day Close
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Closing the drawer will end this shift and generate a Z Report. Count the cash in the drawer and enter the amount below.
                  </p>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Closing Cash Count</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={closingAmount}
                          onChange={(e) => setClosingAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-9 w-40"
                          data-testid="input-closing-balance"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                      <Input
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        placeholder="Any notes about this shift..."
                        data-testid="input-close-notes"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      className="gap-2 bg-destructive text-destructive-foreground"
                      onClick={() => closeDrawerMutation.mutate()}
                      disabled={closeDrawerMutation.isPending}
                      data-testid="button-confirm-close"
                    >
                      <Lock className="w-4 h-4" />
                      {closeDrawerMutation.isPending ? "Closing..." : "Close Drawer & Generate Z Report"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCloseDialog(false)} data-testid="button-cancel-close">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {viewingReportId && zReport && (
          <ZReportView report={zReport} timezone={timezone} onClose={() => setViewingReportId(null)} />
        )}

        {closedSessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Shift History
            </h2>
            {closedSessions.map((session) => (
              <Card key={session.id} data-testid={`session-history-${session.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedHistory(expandedHistory === session.id ? null : session.id)}
                        className="text-muted-foreground"
                        data-testid={`button-expand-session-${session.id}`}
                      >
                        {expandedHistory === session.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium">
                          {formatInTz(session.openedAt, timezone, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatInTz(session.openedAt, timezone, "h:mm a")} - {session.closedAt ? formatInTz(session.closedAt, timezone, "h:mm a") : "N/A"}
                          {session.openedBy && ` | ${session.openedBy}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs text-muted-foreground mr-2">
                        <div>Open: ${Number(session.openingBalance).toFixed(2)}</div>
                        {session.closingBalance && <div>Close: ${Number(session.closingBalance).toFixed(2)}</div>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setViewingReportId(viewingReportId === session.id ? null : session.id)}
                        data-testid={`button-view-report-${session.id}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Z Report
                      </Button>
                    </div>
                  </div>
                  {expandedHistory === session.id && session.actions && (
                    <div className="mt-3 pt-3 border-t space-y-1.5">
                      {session.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            {action.type === "open_drawer" && <Unlock className="w-3 h-3 text-muted-foreground" />}
                            {action.type === "cash_in" && <ArrowDownCircle className="w-3 h-3 text-green-600" />}
                            {action.type === "cash_out" && <ArrowUpCircle className="w-3 h-3 text-destructive" />}
                            {action.type === "close_drawer" && <Lock className="w-3 h-3 text-muted-foreground" />}
                            <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                            {action.reason && <span className="text-muted-foreground">- {action.reason}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {action.amount && <span className={cn("font-medium", action.type === "cash_in" ? "text-green-600" : action.type === "cash_out" ? "text-destructive" : "")}>
                              ${Number(action.amount).toFixed(2)}
                            </span>}
                            <span className="text-muted-foreground">
                              {formatInTz(action.performedAt, timezone, "h:mm a")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ZReportView({
  report,
  timezone,
  onClose,
}: {
  report: any;
  timezone: string;
  onClose: () => void;
}) {
  const session = report.session;
  const closingBal = Number(session.closingBalance) || 0;
  const variance = closingBal - report.expectedCash;

  return (
    <Card className="border-2" data-testid="z-report-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Z Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()} data-testid="button-print-zreport">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-zreport">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatInTz(session.openedAt, timezone, "EEEE, MMMM d, yyyy")}
          {" | "}
          {formatInTz(session.openedAt, timezone, "h:mm a")} - {session.closedAt ? formatInTz(session.closedAt, timezone, "h:mm a") : "Current"}
        </p>
        {session.openedBy && (
          <p className="text-xs text-muted-foreground">
            Opened by {session.openedBy}{session.closedBy ? ` | Closed by ${session.closedBy}` : ""}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-md p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-xl font-bold" data-testid="zr-transaction-count">{report.transactionCount}</p>
          </div>
          <div className="bg-muted/50 rounded-md p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-xl font-bold" data-testid="zr-total-sales">${report.totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-muted/50 rounded-md p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Total Tips</p>
            <p className="text-xl font-bold" data-testid="zr-total-tips">${report.totalTips.toFixed(2)}</p>
          </div>
        </div>

        {report.totalDiscounts > 0 && (
          <div className="flex items-center justify-between text-sm bg-muted/30 rounded-md p-3">
            <span className="text-muted-foreground">Total Discounts</span>
            <span className="font-medium text-green-600" data-testid="zr-total-discounts">-${report.totalDiscounts.toFixed(2)}</span>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Payment Method Breakdown</h4>
          {Object.keys(report.paymentBreakdown).length > 0 ? (
            <div className="space-y-1.5">
              {Object.entries(report.paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" data-testid={`zr-payment-${method}`}>
                  <div className="flex items-center gap-2">
                    {method === "cash" && <Banknote className="w-4 h-4 text-green-600" />}
                    {method === "card" && <CreditCard className="w-4 h-4 text-blue-600" />}
                    {method === "mobile" && <Smartphone className="w-4 h-4 text-purple-600" />}
                    {!["cash", "card", "mobile"].includes(method) && <DollarSign className="w-4 h-4 text-muted-foreground" />}
                    <span className="capitalize">{method}</span>
                  </div>
                  <span className="font-medium">${(amount as number).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No transactions recorded</p>
          )}
        </div>

        <div className="border-t pt-3 space-y-2">
          <h4 className="text-sm font-medium">Cash Reconciliation</h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opening Balance</span>
              <span>${Number(session.openingBalance).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cash Sales</span>
              <span>${(report.paymentBreakdown["cash"] || 0).toFixed(2)}</span>
            </div>
            {report.cashIn > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cash In (Paid In)</span>
                <span>+${report.cashIn.toFixed(2)}</span>
              </div>
            )}
            {report.cashOut > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Cash Out (Paid Out)</span>
                <span>-${report.cashOut.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Expected Cash in Drawer</span>
              <span data-testid="zr-expected-cash">${report.expectedCash.toFixed(2)}</span>
            </div>
            {session.closingBalance && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Cash Count</span>
                  <span data-testid="zr-actual-cash">${closingBal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Variance (Over/Short)</span>
                  <span className={cn(
                    variance === 0 ? "text-green-600" : variance > 0 ? "text-blue-600" : "text-destructive"
                  )} data-testid="zr-variance">
                    {variance === 0 ? "Even" : variance > 0 ? `+$${variance.toFixed(2)} Over` : `-$${Math.abs(variance).toFixed(2)} Short`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {session.notes && (
          <div className="bg-muted/30 rounded-md p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{session.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
