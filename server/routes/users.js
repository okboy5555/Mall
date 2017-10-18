var express = require('express');
var router = express.Router();
var User = require('./../models/users');
require('./../util/util')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/test', function (req, res, next) {
  res.send('123');
});
//登陆
router.post('/login', function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  console.log(param);
  User.findOne(param, function (err, doc) {
    //console.log(err);
    if (!doc) {
      res.json({
        status: "1",
        msg: "输入错误"
      });
    } else {
      if (doc) {
        res.cookie("userId", doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        });
        //req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
})
//登出
router.post("/logout", function (req, res, next) {
  res.cookie("userId", '', {
    path: "/",
    maxAge: -1
  })
  res.json({
    status: "0",
    msg: '',
    result: ''
  })
});
//判断是否登陆
router.get("/checkLogin", function (req, res, next) {
  console.log("req.cookies.userId:" + req.cookies.userId);
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '已登陆',
      result: req.cookies.userId || ''
    });
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    });
  }
});
//查询当前用户的购物车数据
router.get('/cartList', function (req, res, next) {
  let userName = req.cookies.userId;
  //console.log(req.cookies);
  User.findOne({
    userName: userName
  }, function (err, doc) {
    console.log(doc);
    if (!doc) {
      res.json({
        status: '1',
        msg: '未登录',
        result: ''
      });
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        });
      }
    }
  })
});

//购物车删除
router.post('/cartDel', function (req, res, next) {
  var userName = req.cookies.userId,
    productId = req.body.productId;
  User.update({
    userName: userName
  }, {
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ""
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: "suc"
      });
    }
  });

});
//修改商品数量
router.post('/cartEdit', function (req, res, next) {
  var userName = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked;
  User.update({
    "userName": userName,
    "cartList.productId": productId
  }, {
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ""
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: "suc"
      });
    }
  })
});
router.post("/editCheckAll", function (req, res, next) {
  var userName = req.cookies.userId,
    checkAll = req.body.checkAll ? '1' : '0';
  User.findOne({
    userName: userName
  }, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user) {
        user.cartList.forEach((item) => {
          item.checked = checkAll;
        })
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            })
          }
        })
      }
    }
  })
})

//查询用户地址接口
router.get('/addressList', function (req, res, next) {
  var userName = req.cookies.userId;
  User.findOne({
    userName: userName
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })

});
router.post("/setDefault", function (req, res, next) {
  var userName = req.cookies.userId;
  var addressId = req.body.addressId;
  if (!addressId) {
    res.json({
      status: '1003',
      msg: "addressId is null",
      result: ''
    })
  } else {
    User.findOne({
      userName: userName
    }, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        var addressList = doc.addressList;
        addressList.forEach((item) => {
          if(item.addressId == addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        })
        doc.save(function(err1,doc1){
          if (err) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          }else{
            res.json({
              status:'0',
              msg:'',
              result:''
            })
          }
        })
      }
    })
  }

})

//删除地址
router.post("/delAddress",function(req,res,next){
  let userName = req.cookies.userId,addressId=req.body.addressId;
  User.update({
    userName:userName
  },{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  },function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:''
      })
    }
  }
)
})
router.post("/payment",function(req,res,next){
  var userName = req.cookies.userId,orderTotal = req.body.orderTotal,addressId = req.body.addressId;
  User.findOne({userName:userName},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      var address = '',goodsList=[];
      //获取当前用户的地址信息
      doc.addressList.forEach((item)=>{
        if(addressId ==item.addressId){
          address = item;
        }
      })
      //获取当前用户购物车购买商品
      doc.cartList.filter((item)=>{
        if(item.checked == '1'){
          goodsList.push(item);
        }
      })

      var platform = '622';
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);

      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform +r1+sysDate+r2;
      
      var order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      }
      doc.orderList.push(order);
      doc.save(function(err1,doc1){
        if(err1){
          res.json({
            status:'1',
            msg:err.message,
            result:''
          });
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
     
      //获取用户购物车购买商品
      
    }
  })
})

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var  userName = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userName:userName}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:err.message,
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
        //console.log(orderId);
         if(orderList.length>0){
           let orderTotal = 0;
           orderList.forEach((item)=>{
              if(item.orderId == orderId){
                console.log(item.orderId);
                console.log(item.orderTotal);
                orderTotal = item.orderTotal;
                console.log(orderTotal);
              }
              
           });
           if(orderTotal>0){
             res.json({
               status:'0',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               }
             })
           }else{
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});
module.exports = router;

