const sampleImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
  'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg',
  'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'
];

const statuses = ['active', 'under-contract', 'sold'];

export function getDummyListings() {
  return Array.from({ length: 10 }).map((_, i) => {
    const image = sampleImages[i % sampleImages.length];
    return {
      _id: `dummy-${i}`,
      title: `Sample Property ${i + 1}`,
      address: `${100 + i} Example St, Ottawa, ON`,
      beds: 2 + (i % 4),
      baths: 1 + (i % 3),
      sqft: 900 + i * 120,
      price: `${(750000 + i * 25000).toLocaleString()}`,
      status: statuses[i % statuses.length],
      images: [image],
      image,
      description: 'A professionally-styled sample property used as a local offline fallback for the demo.',
      agent: 'Demo Agent',
      agentPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      mls: `DUMMY-${1000 + i}`
    };
  });
}

export function getDummyListing(id) {
  if (!id) return null;
  const idxMatch = id.toString().match(/^dummy-(\d+)$/);
  if (!idxMatch) return null;
  const idx = parseInt(idxMatch[1], 10);
  const list = getDummyListings();
  return list[idx] || null;
}

export default getDummyListings;
