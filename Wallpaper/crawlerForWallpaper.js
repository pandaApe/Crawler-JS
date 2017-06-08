const cheerio = require('cheerio');
const fs = require('fs');
const htmlReq = require('superagent');

//抓取
htmlReq.get('http://app.zol.com.cn/bizhi/youxi/').end(function(err, result) {

  if (err) {

    console.log("Error happend: " + err);

    return;
  }

  var $ = cheerio.load(result.text);

  var imagRows = $('body > div.content > section:nth-child(3) > ul')

  var resultArray = []

  //遍历首页
  for (var i in imagRows.children()) {

    var list = imagRows.children()[i].children

    for (var j in list) {

      var imgItem = list[j]

      if (!imgItem) {
        break
      }
      if (!imgItem.attribs) {
        break
      }
      if (!imgItem.attribs.href) {
        break
      }

      // var c = $('body > div.content > section:nth-child(3) > ul > li:nth-child(' + i + ') > a:nth-child(' + j + ')')
      var subUrl = "http://app.zol.com.cn" + imgItem.attribs.href

      htmlReq.get(subUrl).end((err, subRes) => {

        if (err) {
          console.log("Error hanppend in subUrl request: " + console.err + "\n" + subUrl);
          return
        }

        var img = {}
        var sub = cheerio.load(subRes.text);

        img.title = sub('body > div.album-header > h1').text()
        img.litpic = sub('body > div.content > section:nth-child(1) > ul > li:nth-child(1) > a:nth-child(1) > img').attr('src')

        var body = []
        img.body = body
        resultArray.push(img)

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

  //3秒后写入文件
  setTimeout(() => {

    var totalCount = 0
    for (var index in resultArray) {

      resultArray[index].imgTotal = resultArray[index].body.length
      totalCount++;
    }

    fs.writeFile(__dirname + "/result.json", JSON.stringify(resultArray), (error) => {

      if (error) {

        console.error("writing error: " + error);
      } else {
        
        console.log(totalCount + "records, All done.");
      }

    })

  }, 3000);
})
