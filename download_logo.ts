import fs from 'fs';
import https from 'https';

https.get('https://cdn.digitalmindsbpo.com/wp-content/uploads/2021/11/cropped-Digital_Minds_Logo_Original.png', (res) => {
  const data: Buffer[] = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    const base64 = buffer.toString('base64');
    fs.writeFileSync('src/logoBase64.ts', `export const logoBase64 = 'data:image/png;base64,${base64}';\n`);
    console.log('Done');
  });
});
