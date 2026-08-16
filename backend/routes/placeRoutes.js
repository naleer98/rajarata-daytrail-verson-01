const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/placeController');

const {
  protect,
  admin
} = require('../middleware/authMiddleware');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});


router.get('/', getPlaces);

router.get('/:id', getPlaceById);

router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  createPlace
);

router.put(
  '/:id',
  protect,
  admin,
  upload.single('image'),
  updatePlace
);

router.delete(
  '/:id',
  protect,
  admin,
  deletePlace
);


module.exports = router;
