var express = require('express');
var router = express.Router();
var UserModel = require("../model/Users");
var GoodsModel = require("../model/Goods");
var md5 = require("md5");
var multiparty = require("multiparty");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', function(req, res, next) {
  res.render('login', { title: '登录页面' });
});


router.post('/api/goods_upload', function(req, res, next) {
	var form = new multiparty.Form({
		uploadDir: "/public/img"
	});
	var result = {
		code: 1,
		message: "商品信息保存成功"
	};
	form.parse(req, function(err, body, files){
		if(err) {
			console.log(err);
		}
//		console.log(body);
		var goods_name = body.goods_name[0];
//console.log(goods_name)
		
		var article = body.article[0];
//		console.log(article)
		var sales = body.sales[0];
		var price = body.price[0];
//		var imgPath = files["img"][0].path.replace("public\\","");
		var gm = new GoodsModel();
		gm.goods_name = goods_name;
		gm.article = article;
		gm.sales = sales;
		gm.price = price;		
//		gm.imgPath = imgPath;
//console.log(goods_name)
		gm.save(function(err){
			if(err) {
				result.code = -99;
				result.message = "商品保存失败";
			}
			res.json(result);
		})
	})
});



//添加商品功能
router.post('/goods', function(req, res, next) {
    var goodsName = req.body.goodsName;
    GoodsModel.find({}, (err, docs)=>{
    	console.log(docs.length);
    	res.json(docs)
  });

})







router.get('/Backstage', function(req, res, next) {
     //判断用户是否登录，如果没登录跳转到login页面。（需要引用session组件）
     console.log(req.session);
     if(req.session == null || req.session.username == null) {
           // res.render('login', { title: '登录页面' });
           res.redirect("/login"); // 重定向
           return;
     }
     res.render('Backstage', {});
});


router.post('/api/login4ajax', function(req, res, next) {
     var username = req.body.username;
     var psw = req.body.psw;
     var yzm = req.body.yzm;
     var result = {
           code: 1,
           message: "登录成功"
     };
     console.log(username,psw)
     UserModel.find({username: username, psw:psw}, (err, docs)=>{
     	console.log(docs)
           if(docs.length == 0) {
                result.code = -101;
                result.message = "您的账号或密码错误。请重新登录。"
           } else {
                // 登录成功的时候，生成session
                req.session.username = username;
                console.log(req.session);
                
                
           }
           res.json(result);
     })
})

//分页
router.get('/ajaxfeny', function(req, res, next) {
  var condition = req.query.condition;
  // 注意代码的健壮性
  // 测试中，有异常系测试。 后端最头疼的是异常系测试。
  var pageNO = req.query.pageNO || 1;
  pageNO = parseInt(pageNO);
  var perPageCnt = req.query.perPageCnt || 10;
  perPageCnt = parseInt(perPageCnt);
 console.log(condition)
  GoodsModel.count({goods_name: {$regex: condition}}, function(err, count){
    if(err){
      console.log(9)
    }
    console.log("数量:" + count);
    var query = GoodsModel.find({goods_name: {$regex: condition}})
    .skip((pageNO-1)*perPageCnt).limit(perPageCnt);
    query.exec(function(err, docs){
      console.log(err, docs);
      var result = {
        total: count,
        data: docs,
        pageNO: pageNO
      }
      res.json(result);
    });
  })
});


module.exports = router;
