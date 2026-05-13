const photos = [
  {
    src: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Precision fade',
  },
  {
    src: 'https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Classic cut',
  },
  {
    src: 'https://images.pexels.com/photos/3998428/pexels-photo-3998428.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Beard styling',
  },
  {
    src: 'https://images.pexels.com/photos/2040189/pexels-photo-2040189.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Hot towel shave',
  },
  {
    src: 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Shop interior',
  },
  {
    src: 'https://images.pexels.com/photos/897271/pexels-photo-897271.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Finishing touches',
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-[#13110d] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#c9a96e] text-xs tracking-[0.4em] uppercase mb-4">Our Work</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Haircut Showcase
          </h2>
          <p className="mt-4 text-white/50 max-w-md mx-auto">
            A journey of style. Glimpse into our world of artistic precision and client satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {photos.map((p, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-lg group ${i === 0 || i === 5 ? 'row-span-1 md:row-span-2' : ''}`}
            >
              <div className={`${i === 0 || i === 5 ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-square'} w-full`}>
                <img
                  src={p.src}
                  alt={p.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium tracking-wide">{p.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
