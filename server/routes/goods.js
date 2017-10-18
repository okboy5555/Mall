var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');
//连接MongoDB数据库
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/imoocmall', {
  useMongoClient: true
});

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.");
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail");
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected");
});
//查询商品列表数据
router.get("/list", function (req, res, next) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let priceLevel = req.param("priceLevel");
  let sort = parseInt(req.query.sort);
  let skip = (page - 1) * pageSize;
  //console.log(skip);
  let priceGt = '',
    priceLte = '';
  let params = {};
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 100;
        break;
      case '1':
        priceGt = 100;
        priceLte = 500;
        break;
      case '2':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '3':
        priceGt = 1000;
        priceLte = 5000;
        break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  let goodsModle = Goods.find(params).skip(skip).limit(pageSize);
  goodsModle.sort({
    'salePrice': sort
  });
  goodsModle.exec(function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      });
    }
  })
})
//加入购物车
router.post('/addCart', function (req, res, next) {
  var userName = 'admin',
    productId = req.body.productId;
  console.log(productId);

  var User = require('../models/users');

  User.findOne({
    userName: userName
  }, function (err, userDoc) {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      })
    } else {
      console.log("userDoc:" + userDoc);
      if (userDoc) {
        let goodsItem = '';
        userDoc.cartList.forEach(function (item) {
          if (item.productId == productId) {
            goodsItem = item;
            item.productNum++;
          }
        })
        if (goodsItem) {
          userDoc.save(function (err2, doc2) {
            if (err2) {
              res.json({
                status: "1",
                msg: err1.message
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: '成功插入'
              })
            }
          })
        } else {
          Goods.findOne({
            productId: productId
          }, function (err1, doc) {
            if (err1) {
              res.json({
                status: "1",
                msg: err1.message
              })
            } else {
              if (doc) {
                doc.productNum = 1;
                doc.checked = 1;
                doc.checked = 1;
                userDoc.cartList.push(doc);
                userDoc.save(function (err2, doc2) {
                  if (err2) {
                    res.json({
                      status: "1",
                      msg: err1.message
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: '成功插入'
                    })
                  }
                })
              }
            }
          })
        }

      }
    }
  })
})
module.exports = router;

