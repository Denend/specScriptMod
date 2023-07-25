import { CyberConnect, event } from "./cc.module"
import { Twitter } from "./twitter.module"
import { headers } from "./twitter.module"
import * as readline from 'readline'
import * as fs from 'fs'

async function myReadline(fileName: string): Promise<string[]> {
    const array: string[] = []
    const readInterface = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity,
    })
    for await (const line of readInterface) {
        array.push(line)
    }
    return array
}

async function main() {
    fs.writeFileSync('broken.txt', '')
    fs.writeFileSync('success.txt', '')

    let enteredEvents: string[] = []
    let brokenCT0: string[] = []
    let successCT0: string[] = []

    const cyberconnect = new CyberConnect('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjJiNjkwNzQtOGQ4OC00MjcyLWFjNGEtMzY4MGFiY2M0ZDA3IiwidGVtcF91c2VyIjpmYWxzZSwiZXhwIjoxNjg4OTM5NTc5LCJpYXQiOjE2ODgzMzQ3NzksImlzcyI6ImxpbmszLnRvIn0.8FHFGAJ7EXGP5htcyZOixIyjWEXr1GI7zYwl9XEWwDY')
    
    const twitterCookies = await myReadline('cookies.txt')
    const proxies = await myReadline('proxies.txt')

    async function subMain() {
        try{
            const events: event[] = await cyberconnect.fetchEvent()
            console.log(events.length)
            for(let event of [events[0]]) {
                let twitterIdent = '';
                // (async() => {
                    // const twitterLink = await cyberconnect.getTwitterLink(event.id, event.title)
                    const twitterLink = 'https://twitter.com/i/spaces/1OwxWwYBLVqxQ'
                    if(twitterLink) {
                        twitterIdent = twitterLink.split('/')[twitterLink.split('/').length - 1]
                        if(!enteredEvents.includes(twitterIdent)) {
                            console.log(`Вступаем в ${event.title}`)
                            for(let [i, cookie] of twitterCookies.entries()) {
                                (async() => {
                                    try {
                                        const jwt = await Twitter.getJWT(cookie, proxies[i])
                                        const audioCookie = await Twitter.getCookie(jwt, proxies[i])
                                        const lifeCycleToken = await Twitter.getLifeCycleToken(cookie, twitterLink, proxies[i])
                                        const session = await Twitter.startWatching(cookie, audioCookie, lifeCycleToken, proxies[i])
                                        await Twitter.ping(cookie, audioCookie, session, proxies[i], event.title, (ct0) => {
                                            if(!successCT0.includes(ct0)) {
                                                console.log(`${ct0} - pinged ${event.title}`)
                                                fs.appendFileSync('success.txt', `${ct0} ${event.title}\n`)
                                                successCT0.push(ct0)
                                            }
                                        })
                                    } catch(e: any) {
                                        const ct0 = cookie.split('; ct0=')[1].split('; ')[0]
                                        if(e.message === 'Не началось') {
                                            console.log(`${event.title} не началось`)
                                        } else {
                                            if(!brokenCT0.includes(ct0)){
                                                fs.appendFileSync('broken.txt', `${e.message} ${ct0}\n`)
                                                brokenCT0.push(ct0)
                                            }
                                            console.log(e)
                                        }

                                    } 
                                })();
                            }
                        }
                    } else {
                        console.log(`${event.title} - Discord event`)
                    }
                // })()
                
                if(!enteredEvents.includes(twitterIdent)){
                    enteredEvents.push(twitterIdent)
                }

                await new Promise(resolve => setTimeout(resolve, 120_000));
            }
        } catch(e: any) {
            console.log(e.cause || e, proxies)
        }
    }

    while(true) {
        await subMain()
    }

    // setInterval(async() => {
    //     await subMain()
    // }, 60_000)
}

main()