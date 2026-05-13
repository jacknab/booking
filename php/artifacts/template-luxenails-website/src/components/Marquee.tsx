export default function Marquee() {
  const items = [
    'Manicure', 'Pedicure', 'Gel Extensions', 'Nail Art', 'Acrylics',
    'Builder Gel', 'Dip Powder', 'Paraffin Treatment', 'Nail Repair', 'Luxury Spa Pedicure',
  ];

  return (
    <div className="bg-[#b8936a] py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-white text-sm tracking-widest uppercase font-light">
            {item}
            <span className="ml-8 text-white/40">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
