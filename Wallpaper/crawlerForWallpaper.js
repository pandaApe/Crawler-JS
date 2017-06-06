const cheerio = require('cheerio');
const fs = require('fs');
var htmlReq = require('superagent');

//抓取
htmlReq.get('http://app.zol.com.cn/bizhi/youxi/').end(function(err, result) {

  var $ = cheerio.load(result.text);
  // console.log(result.text)
  var c = $('body > div.content > section:nth-child(3) > ul')
  // console.log(c);
  var a = []
  var count = 0
  //遍历首页
  for (var i in c.children()) {
    var lis = c.children()[i].children

    for (var j in lis) {
      var item = lis[j]
      if (!item) {
        break
      }
      if (!item.attribs) {
        break
      }
      if (!item.attribs.href) {
        break
      }
      // console.log(''+i+ j);
      // // console.log(item)
      // console.log(item.attribs.href);


      // var c = $('body > div.content > section:nth-child(3) > ul > li:nth-child(' + i + ') > a:nth-child(' + j + ')')

      var subUrl = "http://app.zol.com.cn" + item.attribs.href

      // console.log(count);
      // if (!c.attr('href')) {
      //   count += 30
      //   // if (count > 700) {
      //   console.log(JSON.stringify(a));
      //   // }
      //   break
      // }

      htmlReq.get(subUrl).end((err, subRes) => {
        var img = {}
        var sub = cheerio.load(subRes.text);

        img.title = sub('body > div.album-header > h1').text()
        img.litpic = sub('body > div.content > section:nth-child(1) > ul > li:nth-child(1) > a:nth-child(1) > img').attr('src')

        var body = []
        img.body = body
        a.push(img)

        for (var k = 1; k <= 10; k++) {
          for (var l = 1; l <= 3; l++) {

            var subC = sub('body > div.content > section:nth-child(1) > ul > li:nth-child(' + k + ') > a:nth-child(' + l + ') > img')
            var contensURL = subC.attr('src')

            if (contensURL) {
              body.push(contensURL)
            }

          }
        }
      })
    }
  }

  //1秒后写入文件
  setTimeout(() => {

    for (var index in a) {
      a[index].imgTotal = item.body.length
    
    }

    var result = {
      "107":a

    }

    fs.writeFile(__dirname + "/result.json", JSON.stringify(result), (error) => {

      console.log('error'+error);
    })

  }, 1000);
})
