var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
  extended: true
}))
var multer = require('multer');
var nameImage = "";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/')
  },
  filename: function (req, file, cb) {
    nameImage = Date.now() + ".jpeg";
    cb(null, nameImage)
  },
  limits: {
    fileSize: 1024*1024*2,
    files: 2,
  }
})

function fileFilter (req, file, cb) {
  if(file.mimetype === 'image/jpeg') {
    // To accept the file pass `true`, like so:
    cb(null, true)
  }else {
    cb(new Error('Duoi file phai la JPEG'))
  }
}

var upload = multer({storage: storage
  , fileFilter: fileFilter
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const {Schema} = require("mongoose");
const uri = "mongodb+srv://admin:cuong2001@cluster0.jsesy.mongodb.net/poly1?retryWrites=true&w=majority";
mongoose.connect(uri).catch(err => console.log("co loi xay ra: " + err.message));

const itemSchema  = new mongoose.Schema({
  ma: String,
  nhanhieu: String,
  namsx: Number,
  giagoc: Number,
  giaban: Number,
  avatar: Array,
})

const itemModel = mongoose.model('items', itemSchema)


/* GET home page. */
router.get('/', function(req, res, next) {
  itemModel.find({}, function (error, result)
  {
    if(error){
      console.log(error)
      res.render('index', {title: 'Index',items: null})
    } else {
      res.render('index', {title: 'Index',items: result})
    }
  })
});

router.post('/create', upload.array('avatar', 2), function (req, res, next){
  let ma = req.body.ma;
  let nhanhieu = req.body.nhanhieu;
  let namsx = req.body.namsx;
  let giagoc = req.body.giagoc;
  let giaban = req.body.giaban;
  let _file = req.files;
  console.log(_file);
  let file = [];

  if (!ma){
    const err = new Error("Khong de trong ma");
    return next(err)
  }
  if (!nhanhieu){
    const err = new Error("Khong de trong nhan hieu");
    return next(err)
  }
  if (!namsx){
    const err = new Error("Khong de trong nam san xuat");
    return next(err)
  }
  if (!giagoc){
    const err = new Error("Khong de trong gia goc");
    return next(err)
  }
  if (!giaban){
    const err = new Error("Khong de trong gia ban");
    return next(err)
  }

  for (var i = 0; i < _file.length; i++) {
    file.push(_file[i].filename);
    console.log("file: "+file + "  do dai: "+ _file[0].originalname.length);

  }

  if(_file.length == 0 ){
    const err = new Error("Chua chon file");
    return next(err)
  }else if(_file[0].originalname.length >= 10){
    const err = new Error("File khong qua 10 ki tu")
    return next(err)
  } else {
    const item = new itemModel({
      ma:ma,
      nhanhieu: nhanhieu,
      namsx: namsx,
      giagoc: giagoc,
      giaban: giaban,
      avatar: file
    })

    item.save(function (error) {
      if(error == null){
        res.redirect("/");
      }else {
        res.render("create", {title: "Create", message: error.message});
      }
    })
  }

})

router.get('/delete/', function (req, res) {
  const id = req.query.id;
  itemModel.deleteOne({_id: id}, function (error) {
    if (error) throw error;
    res.redirect("/")
  })
})

router.get('/updateForm', function (req, res) {
  const id = req.query.id;
  itemModel.findOne({_id: id}, function (error, result) {
    res.render('update', {title: 'Update', items: result});
  })
})

router.post('/update',upload.array("avatar", 2), async function (req, res) {
  let id = req.body.id;
  let ma = req.body.ma;
  let nhanhieu = req.body.nhanhieu;
  let namsx = req.body.namsx;
  let giagoc = req.body.giagoc;
  let giaban = req.body.giaban;
  let _file = req.files;
  let file = [];
  for (let i = 0; i < _file.length; i++) {
    file.push(_file[i].filename);
  }
  await itemModel.updateOne({_id: id}, {
    ma: ma,
    nhanhieu: nhanhieu,
    namsx: namsx,
    giagoc: giagoc,
    giaban: giaban,
    avatar: file
  }, null)
  res.redirect('/')
})

router.post("/search", function (req, res,) {
  let ma = req.body.timKiem;
  itemModel.findOne({ma: ma}, function (err, data) {
    if (err == null) {
      if (data == null) {
        res.render("Search", {title: "Search", data: null, message: "K tim thay san pham!"});
      } else {
        res.render("Search", {title: "Search", data: data, message: "Da tim thay!"});
      }
    } else {
      res.send({
        trangThai: 1
      });
      console.log(err.message);
    }
  })
})
module.exports = router;
