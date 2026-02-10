export type BusinessTemplate = {
  categories: {
    name: string;
    services: {
      name: string;
      description: string;
      duration: number;
      price: string;
      addons?: { name: string; description: string; price: string; duration: number }[];
    }[];
  }[];
};

export const businessTemplates: Record<string, BusinessTemplate> = {
  "Hair Salon": {
    categories: [
      {
        name: "Haircuts",
        services: [
          {
            name: "Women's Haircut",
            description: "Wash, cut and blow dry",
            duration: 60,
            price: "65.00",
            addons: [
              { name: "Deep Conditioning", description: "Intensive moisture treatment", price: "15.00", duration: 15 },
              { name: "Scalp Massage", description: "Relaxing scalp treatment", price: "10.00", duration: 10 },
              { name: "Bang Trim", description: "Quick fringe trim", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Men's Haircut",
            description: "Classic men's cut and style",
            duration: 30,
            price: "35.00",
            addons: [
              { name: "Beard Trim", description: "Shape and trim beard", price: "10.00", duration: 10 },
              { name: "Hot Towel", description: "Relaxing hot towel finish", price: "5.00", duration: 5 },
            ],
          },
          {
            name: "Children's Haircut",
            description: "Haircut for children under 12",
            duration: 30,
            price: "25.00",
          },
          {
            name: "Blow Dry & Style",
            description: "Professional blow dry and styling",
            duration: 45,
            price: "45.00",
            addons: [
              { name: "Deep Conditioning", description: "Intensive moisture treatment", price: "15.00", duration: 15 },
            ],
          },
        ],
      },
      {
        name: "Color",
        services: [
          {
            name: "Full Color",
            description: "Full head single-process color",
            duration: 120,
            price: "150.00",
            addons: [
              { name: "Gloss Treatment", description: "Add shine and tone", price: "25.00", duration: 15 },
              { name: "Olaplex Treatment", description: "Bond repair treatment", price: "35.00", duration: 20 },
            ],
          },
          {
            name: "Root Touch-Up",
            description: "Color application at the roots",
            duration: 75,
            price: "85.00",
            addons: [
              { name: "Gloss Treatment", description: "Add shine and tone", price: "25.00", duration: 15 },
            ],
          },
          {
            name: "Highlights - Partial",
            description: "Face-framing foil highlights",
            duration: 90,
            price: "120.00",
            addons: [
              { name: "Toner", description: "Tone and neutralize brassiness", price: "20.00", duration: 15 },
              { name: "Olaplex Treatment", description: "Bond repair treatment", price: "35.00", duration: 20 },
            ],
          },
          {
            name: "Highlights - Full",
            description: "Full head foil highlights",
            duration: 150,
            price: "180.00",
            addons: [
              { name: "Toner", description: "Tone and neutralize brassiness", price: "20.00", duration: 15 },
              { name: "Olaplex Treatment", description: "Bond repair treatment", price: "35.00", duration: 20 },
            ],
          },
          {
            name: "Balayage",
            description: "Hand-painted natural highlights",
            duration: 180,
            price: "220.00",
            addons: [
              { name: "Toner", description: "Tone and neutralize brassiness", price: "20.00", duration: 15 },
              { name: "Olaplex Treatment", description: "Bond repair treatment", price: "35.00", duration: 20 },
            ],
          },
        ],
      },
      {
        name: "Treatments",
        services: [
          {
            name: "Keratin Treatment",
            description: "Smoothing keratin treatment",
            duration: 150,
            price: "250.00",
          },
          {
            name: "Hair Mask",
            description: "Deep conditioning mask treatment",
            duration: 30,
            price: "35.00",
          },
          {
            name: "Scalp Treatment",
            description: "Exfoliating scalp detox",
            duration: 30,
            price: "40.00",
          },
        ],
      },
      {
        name: "Styling",
        services: [
          {
            name: "Updo / Event Style",
            description: "Formal or event hairstyle",
            duration: 75,
            price: "85.00",
          },
          {
            name: "Bridal Hair",
            description: "Wedding day hairstyling with trial",
            duration: 90,
            price: "150.00",
          },
        ],
      },
    ],
  },

  "Nail Salon": {
    categories: [
      {
        name: "Manicures",
        services: [
          {
            name: "Classic Manicure",
            description: "File, shape, cuticle care and polish",
            duration: 30,
            price: "25.00",
            addons: [
              { name: "French Tips", description: "Classic white tips", price: "5.00", duration: 10 },
              { name: "Nail Art - Simple", description: "Simple designs on 1-2 nails", price: "5.00", duration: 10 },
              { name: "Paraffin Wax Treatment", description: "Hydrating wax treatment", price: "8.00", duration: 15 },
              { name: "Hot Oil Cuticle Treatment", description: "Nourishing oil massage", price: "7.00", duration: 15 },
              { name: "Polish Change", description: "Quick polish change only", price: "5.00", duration: 5 },
            ],
          },
          {
            name: "Gel Manicure",
            description: "Long-lasting gel polish manicure",
            duration: 45,
            price: "40.00",
            addons: [
              { name: "French Tips", description: "Classic white tips", price: "5.00", duration: 10 },
              { name: "Nail Art - Advanced", description: "Detailed multi-nail art", price: "15.00", duration: 25 },
              { name: "Gel Removal", description: "Safe gel polish removal", price: "5.00", duration: 15 },
              { name: "Nail Art - Simple", description: "Simple designs on 1-2 nails", price: "5.00", duration: 10 },
            ],
          },
          {
            name: "Dip Powder Manicure",
            description: "Dip powder nail application",
            duration: 60,
            price: "50.00",
            addons: [
              { name: "Dip Removal", description: "Safe dip powder removal", price: "10.00", duration: 15 },
              { name: "Nail Art - Simple", description: "Simple designs on 1-2 nails", price: "5.00", duration: 10 },
            ],
          },
          {
            name: "Acrylic Full Set",
            description: "Full set acrylic nail extensions",
            duration: 75,
            price: "55.00",
            addons: [
              { name: "Nail Art - Advanced", description: "Detailed multi-nail art", price: "15.00", duration: 25 },
              { name: "Extra Length", description: "Extra long nail extensions", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Acrylic Fill",
            description: "Acrylic nail fill/maintenance",
            duration: 45,
            price: "35.00",
            addons: [
              { name: "Nail Art - Simple", description: "Simple designs on 1-2 nails", price: "5.00", duration: 10 },
            ],
          },
        ],
      },
      {
        name: "Pedicures",
        services: [
          {
            name: "Classic Pedicure",
            description: "Soak, scrub, trim and polish",
            duration: 45,
            price: "40.00",
            addons: [
              { name: "French Tips", description: "Classic white tips", price: "5.00", duration: 10 },
              { name: "Paraffin Wax Treatment", description: "Hydrating wax treatment", price: "8.00", duration: 15 },
              { name: "Extra Massage", description: "Additional foot and leg massage", price: "10.00", duration: 10 },
              { name: "Callus Removal", description: "Extra callus treatment", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Gel Pedicure",
            description: "Pedicure with long-lasting gel polish",
            duration: 60,
            price: "55.00",
            addons: [
              { name: "Paraffin Wax Treatment", description: "Hydrating wax treatment", price: "8.00", duration: 15 },
              { name: "Extra Massage", description: "Additional foot and leg massage", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Deluxe Spa Pedicure",
            description: "Premium pedicure with scrub, mask and hot stones",
            duration: 75,
            price: "70.00",
            addons: [
              { name: "Paraffin Wax Treatment", description: "Hydrating wax treatment", price: "8.00", duration: 15 },
            ],
          },
        ],
      },
      {
        name: "Extras",
        services: [
          {
            name: "Nail Repair",
            description: "Single nail repair",
            duration: 15,
            price: "10.00",
          },
          {
            name: "Polish Change - Hands",
            description: "Quick polish change on hands",
            duration: 15,
            price: "12.00",
          },
          {
            name: "Polish Change - Feet",
            description: "Quick polish change on feet",
            duration: 15,
            price: "15.00",
          },
          {
            name: "Nail Removal",
            description: "Safe removal of acrylics, gel or dip",
            duration: 30,
            price: "20.00",
          },
        ],
      },
    ],
  },

  "Spa": {
    categories: [
      {
        name: "Massage",
        services: [
          {
            name: "Swedish Massage - 60 min",
            description: "Full body relaxation massage",
            duration: 60,
            price: "85.00",
            addons: [
              { name: "Aromatherapy", description: "Essential oil enhancement", price: "10.00", duration: 5 },
              { name: "Hot Stones", description: "Add heated stones to massage", price: "15.00", duration: 10 },
              { name: "Extended Time - 30 min", description: "Add 30 minutes to session", price: "40.00", duration: 30 },
            ],
          },
          {
            name: "Swedish Massage - 90 min",
            description: "Extended full body relaxation massage",
            duration: 90,
            price: "120.00",
            addons: [
              { name: "Aromatherapy", description: "Essential oil enhancement", price: "10.00", duration: 5 },
              { name: "Hot Stones", description: "Add heated stones to massage", price: "15.00", duration: 10 },
            ],
          },
          {
            name: "Deep Tissue Massage",
            description: "Targeted therapeutic deep tissue work",
            duration: 60,
            price: "95.00",
            addons: [
              { name: "Cupping", description: "Add cupping therapy", price: "20.00", duration: 15 },
              { name: "Extended Time - 30 min", description: "Add 30 minutes to session", price: "45.00", duration: 30 },
            ],
          },
          {
            name: "Hot Stone Massage",
            description: "Full body heated stone therapy",
            duration: 75,
            price: "110.00",
          },
          {
            name: "Couples Massage",
            description: "Side-by-side relaxation massage for two",
            duration: 60,
            price: "170.00",
          },
          {
            name: "Prenatal Massage",
            description: "Gentle massage for expectant mothers",
            duration: 60,
            price: "90.00",
          },
        ],
      },
      {
        name: "Facials",
        services: [
          {
            name: "Classic Facial",
            description: "Deep cleanse, exfoliate and hydrate",
            duration: 60,
            price: "85.00",
            addons: [
              { name: "LED Light Therapy", description: "Anti-aging LED treatment", price: "20.00", duration: 15 },
              { name: "Lip Treatment", description: "Hydrating lip mask", price: "10.00", duration: 10 },
              { name: "Eye Treatment", description: "De-puffing eye mask", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Anti-Aging Facial",
            description: "Targeted anti-aging treatment with peptides",
            duration: 75,
            price: "120.00",
            addons: [
              { name: "LED Light Therapy", description: "Anti-aging LED treatment", price: "20.00", duration: 15 },
              { name: "Microdermabrasion", description: "Crystal exfoliation add-on", price: "30.00", duration: 20 },
            ],
          },
          {
            name: "Hydrating Facial",
            description: "Intensive moisture boost facial",
            duration: 60,
            price: "95.00",
          },
          {
            name: "Acne Treatment Facial",
            description: "Deep pore cleansing for acne-prone skin",
            duration: 60,
            price: "90.00",
          },
        ],
      },
      {
        name: "Body Treatments",
        services: [
          {
            name: "Body Scrub",
            description: "Full body exfoliation treatment",
            duration: 45,
            price: "75.00",
          },
          {
            name: "Body Wrap",
            description: "Detoxifying or hydrating body wrap",
            duration: 60,
            price: "90.00",
          },
          {
            name: "Mud Treatment",
            description: "Mineral-rich mud body treatment",
            duration: 60,
            price: "95.00",
          },
        ],
      },
      {
        name: "Waxing",
        services: [
          {
            name: "Eyebrow Wax",
            description: "Precision eyebrow shaping",
            duration: 15,
            price: "18.00",
          },
          {
            name: "Lip Wax",
            description: "Upper lip waxing",
            duration: 10,
            price: "12.00",
          },
          {
            name: "Full Leg Wax",
            description: "Complete leg waxing",
            duration: 45,
            price: "65.00",
          },
          {
            name: "Bikini Wax",
            description: "Standard bikini line wax",
            duration: 20,
            price: "35.00",
          },
          {
            name: "Full Arm Wax",
            description: "Complete arm waxing",
            duration: 30,
            price: "40.00",
          },
          {
            name: "Underarm Wax",
            description: "Underarm waxing",
            duration: 15,
            price: "20.00",
          },
        ],
      },
    ],
  },

  "Barbershop": {
    categories: [
      {
        name: "Haircuts",
        services: [
          {
            name: "Men's Haircut",
            description: "Classic men's cut and style",
            duration: 30,
            price: "30.00",
            addons: [
              { name: "Hot Towel", description: "Relaxing hot towel finish", price: "5.00", duration: 5 },
              { name: "Hair Wash", description: "Shampoo and condition", price: "5.00", duration: 10 },
            ],
          },
          {
            name: "Skin Fade",
            description: "Precision skin fade haircut",
            duration: 45,
            price: "35.00",
            addons: [
              { name: "Design / Line Up", description: "Custom hair design", price: "10.00", duration: 10 },
            ],
          },
          {
            name: "Buzz Cut",
            description: "All-over clipper cut",
            duration: 15,
            price: "18.00",
          },
          {
            name: "Kids Haircut",
            description: "Children's haircut (under 12)",
            duration: 20,
            price: "20.00",
          },
        ],
      },
      {
        name: "Beard & Shave",
        services: [
          {
            name: "Beard Trim",
            description: "Shape and trim beard",
            duration: 20,
            price: "20.00",
            addons: [
              { name: "Beard Oil Treatment", description: "Conditioning beard oil", price: "5.00", duration: 5 },
            ],
          },
          {
            name: "Hot Towel Shave",
            description: "Traditional straight razor shave with hot towel",
            duration: 30,
            price: "40.00",
          },
          {
            name: "Beard Design",
            description: "Custom beard sculpting and design",
            duration: 30,
            price: "30.00",
          },
          {
            name: "Haircut + Beard Combo",
            description: "Full haircut with beard trim",
            duration: 45,
            price: "45.00",
            addons: [
              { name: "Hot Towel", description: "Relaxing hot towel finish", price: "5.00", duration: 5 },
              { name: "Beard Oil Treatment", description: "Conditioning beard oil", price: "5.00", duration: 5 },
            ],
          },
        ],
      },
      {
        name: "Grooming",
        services: [
          {
            name: "Eyebrow Cleanup",
            description: "Eyebrow shaping and trim",
            duration: 10,
            price: "10.00",
          },
          {
            name: "Nose / Ear Wax",
            description: "Quick nose or ear hair removal",
            duration: 10,
            price: "10.00",
          },
          {
            name: "Head Shave",
            description: "Full head razor shave",
            duration: 30,
            price: "35.00",
          },
        ],
      },
    ],
  },
};
