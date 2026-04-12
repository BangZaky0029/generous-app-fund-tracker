const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
  { name: "03_Admin_Dashboard.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE4MTAwNjQ2OTMwZTRhYzViMmMyMjg5M2ZhZWZlNzc3EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "06_Dashboard_Donatur.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I1OWZiNGUwZjQwYzQ2OTNiZTc5MjM2OTVmMGU4MmMyEgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "01_Daftar_Peran.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzlhOThiZTA0OGIxZTQxYTU4YjlkYTljM2M3YWNmOWFmEgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "02_Login_Peran.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2RkMzE5MTI0ZjdlMTQwOGM5NjcwOGU1OTVhN2YwMGI5EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "04_Validasi_Kamera.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ2MGY5NTE0N2Q2NTQ5Zjk5OTg2MDQwZWMwOTFjY2JmEgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "05_Daftar_Peran_2.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZjNmMGVkODcyODAwN2M0ZGU0OWYzMWMwMGZhEgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "07_Profil_Donatur.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E2NzM5NWRmNDVjZjRiOTM5MGFjZTUyNjkyYzdhYTFmEgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "08_Manajemen_Bukti.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JhMTJjNDY0MzczOTQ0NDRhM2I3MzJlNzdhMThmYTA2EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "09_Input_Pengeluaran.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNkY2Q5MGExY2NlMTQ2ZjJiNzU1M2ZmYWZkYTU5YTY1EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "10_Laporan_Donatur.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzUzM2FlNGM1NGE2NTQ1OGZiYzQ2OGZhMzk2MTc1YzI3EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" },
  { name: "11_Login_Peran_2.html", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY0ZjNmMGViYTZhYzQwMmE5YjZkNGIyMDgyMzc5EgsSBxC5-Ke98hYYAZIBIwoKcHJvamVjdF9pZBIVQhM5MTU1MDI5NjgzNzg3OTk2ODQ0&filename=&opi=89354086" }
];

const outDir = path.join(__dirname, 'stitch_ui_code');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  for (const s of screens) {
    console.log(`Downloading ${s.name}...`);
    try {
      await download(s.url, path.join(outDir, s.name));
    } catch (e) {
      console.error(`Failed ${s.name}:`, e);
    }
  }
}

run();
