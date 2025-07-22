const jsonFiles = [
  'chunk_001.json',
  'chunk_002.json',
  // If we need another, add it here
];

Promise.all(jsonFiles.map(file => 
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        return data.length;
      } else {
        console.warn(`${file} is not an array.`);
        return 0;
      }
    })
    .catch(err => {
      console.error(`Error processing ${file}:`, err);
      return 0;
    })
)).then(counts => {
  const total = counts.reduce((sum, count) => sum + count, 0);
  document.getElementById('entryCount').textContent = `Total number of entries: ${total}`;
});
