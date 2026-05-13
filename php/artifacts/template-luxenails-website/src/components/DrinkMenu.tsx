import { Wine, Coffee, Droplets } from 'lucide-react';

interface DrinkCategory {
  name: string;
  icon: React.FC<{ className: string }>;
  items: {
    name: string;
    description: string;
  }[];
}

const drinkCategories: DrinkCategory[] = [
  {
    name: 'Hot Tea',
    icon: Coffee,
    items: [
      {
        name: 'Green Tea',
        description: 'Light, smooth, and full of antioxidants, our green tea offers a clean, refreshing sip to soothe and energize.',
      },
      {
        name: 'Peppermint Tea',
        description: 'Naturally caffeine-free, this herbal infusion delivers a cool, minty aroma with every calming sip.',
      },
      {
        name: 'Lemon Ginger Tea',
        description: 'A zesty blend of citrus and spice, this soothing tea is perfect for a refreshing boost or a comforting moment.',
      },
    ],
  },
  {
    name: 'Soda',
    icon: Droplets,
    items: [
      {
        name: 'Coke',
        description: 'Bold, crisp, and refreshingly classic—served chilled for that perfect sip.',
      },
      {
        name: 'Diet Coke',
        description: 'Light, bubbly, and guilt-free with the same iconic taste—refreshment without compromise.',
      },
      {
        name: 'Dr. Pepper',
        description: 'A rich blend of 23 flavors, perfectly balanced for a uniquely smooth and satisfying taste.',
      },
      {
        name: 'Sprite',
        description: 'Clean, crisp lemon-lime flavor with a refreshing citrus twist in every bubbly sip.',
      },
      {
        name: 'Lemonade',
        description: 'Freshly squeezed citrus goodness with a perfect balance of sweet and tart.',
      },
    ],
  },
  {
    name: 'Water',
    icon: Droplets,
    items: [
      {
        name: 'Sparkling Water',
        description: 'Bright, effervescent, and refreshing—ideal on its own or as a palate cleanser.',
      },
      {
        name: 'Distilled Water',
        description: 'Pure and crisp, served chilled for clean, refreshing hydration.',
      },
    ],
  },
  {
    name: 'Coffee',
    icon: Coffee,
    items: [
      {
        name: 'Freshly Brewed Coffee',
        description: 'Freshly brewed and rich—smooth, bold flavor to energize your day. Cream and sugar provided.',
      },
    ],
  },
  {
    name: 'Matcha',
    icon: Coffee,
    items: [
      {
        name: 'Traditional Matcha',
        description: 'Premium Japanese green tea powder whisked to silky perfection. A vibrant, antioxidant-rich ritual.',
      },
      {
        name: 'Matcha Latte',
        description: 'Creamy and luxurious—traditional matcha blended with your choice of milk for a smooth, earthy indulgence.',
      },
    ],
  },
  {
    name: 'Red Wine',
    icon: Wine,
    items: [
      {
        name: 'Bold Red',
        description: 'Full-bodied with rich dark fruit notes and a smooth, velvety finish.',
      },
      {
        name: 'Light Red',
        description: 'Elegant and light with bright cherry, berry, and subtle earthy undertones.',
      },
    ],
  },
  {
    name: 'White Wine',
    icon: Wine,
    items: [
      {
        name: 'Crisp White',
        description: 'Crisp and refreshing with vibrant citrus and tropical fruit notes.',
      },
      {
        name: 'Full-Bodied White',
        description: 'Smooth and full with hints of ripe apple, pear, and a touch of oak.',
      },
      {
        name: 'Delicate White',
        description: 'Light, clean, and crisp with delicate floral and citrus notes.',
      },
    ],
  },
  {
    name: 'Rosé Wine',
    icon: Wine,
    items: [
      {
        name: 'Dry Rosé',
        description: 'Bright and refreshing with delicate berry notes and a crisp, dry finish.',
      },
    ],
  },
  {
    name: 'Sparkling Wine',
    icon: Wine,
    items: [
      {
        name: 'Classic Sparkling',
        description: 'Delicate bubbles with crisp apple, pear, and a hint of citrus—perfectly refreshing.',
      },
      {
        name: 'Sparkling Blend',
        description: 'Bright, bubbly, and elegant with subtle notes of red berries and a dry finish.',
      },
    ],
  },
  {
    name: 'Cocktails',
    icon: Wine,
    items: [
      {
        name: 'Mimosa',
        description: 'A classic blend of chilled sparkling wine and fresh orange juice—light, bubbly, and refreshing.',
      },
    ],
  },
];

export default function DrinkMenu() {
  return (
    <section className="min-h-screen bg-[#faf8f5] pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[#b8936a] tracking-[0.3em] uppercase text-xs font-light mb-4">
            Beverages
          </p>
          <h1 className="text-5xl md:text-6xl font-extralight text-[#1a1a1a] mb-6">
            Our <span className="font-semibold">Drink Menu</span>
          </h1>
          <p className="text-[#5a5a5a] font-light text-lg max-w-2xl mx-auto leading-relaxed">
            Indulge in our curated selection of premium beverages. From soothing teas and artisan coffee to fine wines and signature cocktails—the perfect complement to your nail experience.
          </p>
          <div className="w-16 h-px bg-[#b8936a] mx-auto mt-8" />
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {drinkCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="bg-white border border-gray-100 hover:border-[#e8c99a] hover:shadow-lg transition-all duration-300 p-8"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <Icon className="w-5 h-5 text-[#b8936a]" />
                  <h2 className="text-xl font-light text-[#1a1a1a] tracking-wide">
                    {category.name}
                  </h2>
                </div>

                {/* Items */}
                <div className="space-y-5">
                  {category.items.map((item) => (
                    <div key={item.name} className="group cursor-pointer">
                      <h3 className="text-sm font-medium text-[#1a1a1a] uppercase tracking-wide group-hover:text-[#b8936a] transition-colors duration-300 mb-1.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#7a7a7a] font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="bg-white border border-gray-100 p-12 text-center">
          <h3 className="text-2xl font-light text-[#1a1a1a] mb-3 tracking-wide">
            Ready for Your Perfect Visit?
          </h3>
          <p className="text-[#5a5a5a] font-light text-lg mb-8 leading-relaxed">
            Book your appointment and enjoy complementary beverages while we perfect your nails.
          </p>
          <a
            href="#booking"
            className="inline-block px-10 py-4 bg-[#b8936a] text-white tracking-widest uppercase text-sm font-light hover:bg-[#a07a54] transition-all duration-300 hover:scale-105"
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}
