const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Files are written to <backend>/uploads and served statically from
// /uploads by server.js. On Heroku's ephemeral filesystem these are
// wiped on dyno restart/redeploy — fine for a capstone demo, but for a
// production app you'd point this at S3/Cloudinary instead.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_TYPES = /jpeg|jpg|png|webp|gif/;

function fileFilter(req, file, cb) {
  const extOk = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = ALLOWED_TYPES.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, 10 files max
});

module.exports = upload;
