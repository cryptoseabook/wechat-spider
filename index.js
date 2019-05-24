const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;


const WX_SOGOU_BASE = "https://weixin.sogou.com"
const WX_BASE = "http://mp.weixin.qq.com"

async function findWePortal(wechatPortalId) {

    let allUrls = []

    try {
        const browser = await puppeteer.launch({devtools: true});
        const page = await browser.newPage();
        await page.goto(WX_SOGOU_BASE, {
          timeout: 120000,
          waitUntil: 'networkidle0'
        });
        await page.type('#query', wechatPortalId)
        await page.click("input[value='搜公众号']")
        await page.waitFor(2000)  

        await page.click('div.news-box p.tit a'),
        await page.waitFor(2000)

        let allPages = await browser.pages()

        let wxPage;
        for (let aPage of allPages) {
            if(aPage.url().startsWith(WX_BASE)) {
                wxPage = aPage;
                break;
            }
        }

        let content = await wxPage.content();
        var $ = cheerio.load(content);
        $('div#history div.weui_msg_card_bd').each((i, elem) => {
            let targetElem = $(elem).find("h4").each((j, elem2) => {
                let aHref = $(elem2).attr('hrefs')
                allUrls.push(aHref)
            })
        })

        await page.goto(`${WX_BASE}${allUrls[0]}`, {
            timeout: 120000,
            waitUntil: 'networkidle0'
          });

        let article = await page.content()
        console.log(article.length)
        await fs.writeFile('filename.html', article);
        // await browser.close()
    } catch (err) {
        console.error(err)
    }
}

findWePortal('ozitquan')