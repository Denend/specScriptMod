const axios = require('axios')
const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt-sync')();
const HttpsProxyAgent = require('https-proxy-agent');

async function sleep(ms){
    return new Promise((resolve, rejects) => {setTimeout(resolve, ms)})
}

axios.defaults.maxContentLength = 1024 * 1024 * 10; // 10 MB
axios.defaults.maxBodyLength = 1024 * 1024 * 10; // 10 MB
axios.defaults.httpAgent = false;
axios.defaults.httpsAgent = false;

// const instance = axios.create({
//     timeout: 180000
// })

class Link3_checker{

    async axiosCallback(resp){
        const set_cookie = resp.headers['set-cookie']

        let session = this.session

        function getData(){
            let data = {}
            for (let i of session.defaults.headers['cookie'].split('; ')){
                let [name, value] = i.split('=')
                data[name] = value
            }
            return data
        }

        function getString(data){
            let _str = ''
            for (let keys of Object.keys(data)){
                _str += `${keys}=${data[keys]}; `
            }
            return _str
        }

        function _split(str, sep){
            return [str.split(sep, 1).toString(), str.split(sep).slice(1).join(sep)]
        }

        if(set_cookie){
            for (let j of set_cookie){
                let data = getData()
                let [name, value] = _split(j, '=')
                data[name] = value
                this.session.defaults.headers['cookie'] = getString(data)
            }
        }
    }

    async myEventsRequest(){
        try {
            const response = await this.session.post(
                'https://api.cyberconnect.dev/profile/',
                {
                    'query': '\n    query getRegisteredEvents($ended: Boolean, $first: Int, $after: String) {\n  me {\n    data {\n      registeredEvents(ended: $ended, first: $first, after: $after) {\n        pageInfo {\n          ...PageInfo\n        }\n        list {\n          id\n          info\n          title\n          posterUrl\n          startTimestamp\n          endTimestamp\n          status\n          registrantsCount\n          registerStatus\n          organizer {\n            ...Organizer\n          }\n          lightInfo {\n            hasRaffle\n            hasW3ST\n          }\n        }\n      }\n    }\n  }\n}\n    \n    fragment PageInfo on PageInfo {\n  startCursor\n  endCursor\n  hasNextPage\n  hasPreviousPage\n}\n    \n\n    fragment Organizer on Organization {\n  twitterId\n  id\n  followersCount\n  verification\n  currentAccess\n  profile {\n    handle\n    id\n    ... on OrgProfile {\n      isFollowing\n      displayName\n      profilePicture\n    }\n  }\n}\n    ',
                    'variables': {
                        'ended': false
                    },
                    'operationName': 'getRegisteredEvents'
                },
                {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Connection': 'keep-alive',
                        'Origin': 'https://link3.to',
                        'Referer': 'https://link3.to/',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'cross-site',
                        'content-type': 'application/json',
                        'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                        'authorization': this.authorization,
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"'
                    }
                }
            )
            // await this.axiosCallback(response)
            return response.data.data.me.data.registeredEvents.list
        } catch (e) {
        }

    }

    async getInviteLink(id){
        const headers = {
            headers: {
                'authority': 'api.cyberconnect.dev',
                'accept': '*/*',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': this.authorization,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'origin': 'https://link3.to',
                'pragma': 'no-cache',
                'referer': 'https://link3.to/',
                'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',

            },
        }
        if(this.userResponse){
            // headers['proxy'] = false
            // headers['httpsAgent'] = this.proxieBatch[10]
        }
        try{
            const response = await axios.post(
                'https://api.cyberconnect.dev/profile/',
                {
                  'query': '\n    query getEventViewData($id: ID!) {\n  event(id: $id) {\n    __typename\n    id\n    title\n    info\n    recap\n    posterUrl\n    startTimestamp\n    endTimestamp\n    timezone\n    registerStatus\n    status\n    speakers {\n      ...Speaker\n    }\n    organizer {\n      twitterId\n      id\n      followersCount\n      verification\n      currentAccess\n      lightInfo {\n        profileHandle\n        isFollowing\n        displayName\n        profilePicture\n      }\n    }\n    w3st {\n      ...W3stOnEventViewPage\n    }\n    registrantsCount\n    registrants(first: 7) {\n      pageInfo {\n        ...PageInfo\n      }\n      list {\n        lightInfo {\n          handle\n          avatar\n          avatarFrameTokenId\n          displayName\n          formattedAddress\n        }\n      }\n    }\n    raffle {\n      ...Raffle\n    }\n    location {\n      __typename\n      ...TwitterSpaceEvent\n      ...DiscordEvent\n      ... on DiscordEvent {\n        inviteLink\n      }\n      ...OtherEvent\n    }\n    tags\n    language\n    recapLikeInfo {\n      likedCount\n      isLiked\n    }\n    registrantsTokenHoldings {\n      collection\n      logo\n      ownedCount\n      ownersCount\n    }\n  }\n}\n    \n    fragment Speaker on EventSpeaker {\n  twitterId\n  twitterHandle\n  displayName\n  avatar\n  title\n  profileId\n  twitterFollowers\n  avatarFrameTokenId\n}\n    \n\n    fragment W3stOnEventViewPage on W3ST {\n  gasless\n  imageUrl\n  contractInfo {\n    deployStatus\n    chainId\n    essenceAddress\n    tokenHoldersCount\n  }\n  requirements {\n    type\n    value\n  }\n}\n    \n\n    fragment PageInfo on PageInfo {\n  startCursor\n  endCursor\n  hasNextPage\n  hasPreviousPage\n}\n    \n\n    fragment Raffle on Raffle {\n  awards {\n    ...TokenAward\n    ...CodeAward\n  }\n  tweetUrl\n  joinStatus {\n    status\n    myAward\n  }\n  winnersCount\n  joinedCount\n  claimDeadline\n  participateDeadline\n  requirement {\n    retweet\n    follow\n    comment\n    likeAndRetweet\n    tag\n    multiFollow\n    twittersToFollow {\n      twitterId\n      twitterHandle\n    }\n  }\n}\n    \n    fragment TokenAward on TokenAward {\n  chainId\n  tokenIcon\n  symbol\n  contractAddress\n  amount\n}\n    \n\n    fragment CodeAward on CodeAward {\n  code\n  description\n}\n    \n\n    fragment TwitterSpaceEvent on TwitterSpaceEvent {\n  link\n}\n    \n\n    fragment DiscordEvent on DiscordEvent {\n  server\n  serverName\n  channel\n  channelName\n  autoSync\n}\n    \n\n    fragment OtherEvent on OtherEvent {\n  link\n}\n    ',
                  'variables': {
                    'id': id
                  },
                  'operationName': 'getEventViewData'
                },
                {
                  headers: {
                    'authority': 'api.cyberconnect.dev',
                    'accept': '*/*',
                    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': this.authorization,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'origin': 'https://link3.to',
                    'pragma': 'no-cache',
                    'referer': 'https://link3.to/',
                    'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
                  }
                }
            )
            if(response.data.data.event.location.link){
                return response.data.data.event.location.link
            }
            else if(response.data.data.event.location.inviteLink){
                return response.data.data.event.location.inviteLink
            }
            else{'something went wrong'}
        }
        catch(e){
            if(e.response) {
                if(e.response.data.errors) {
                    console.log(e.response.data.errors)
                } else {
                    console.log(e.response)
                }
            } else {
                console.log(e)
            }
            return
        }
    }

    async getMediaKey(inviteLink){
        const headers = {
            params: {
                'variables': `{"id":"${inviteLink.split('/spaces/')[1].split('?')[0]}","isMetatagsQuery":false,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withReplays":true}`,
                'features': '{"spaces_2022_h2_clipping":true,"spaces_2022_h2_spaces_communities":true,"responsive_web_twitter_blue_verified_badge_is_enabled":true,"verified_phone_label_enabled":false,"view_counts_public_visibility_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}'
            },
            headers: {
                'authority': 'twitter.com',
                'accept': '*/*',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'content-type': 'application/json',
                'cookie': this.twitterCookie,
                'referer': 'https://twitter.com/i/spaces/1BdGYyDgEkgGX',
                'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'x-csrf-token': this.twitterXCSRF,
                'x-twitter-active-user': 'yes',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-client-language': 'en'
            },
        }
        if(this.userResponse){
            headers['proxy'] = false
            headers['httpsAgent'] = this.proxieBatch[0]
        }
        try{
            const response = await axios.get('https://twitter.com/i/api/graphql/RmPtV8RHiRUwy1xOm2Or1Q/AudioSpaceById', headers)
            return response.data.data.audioSpace.metadata.media_key
        } catch(e) {
            return
        }

    }

    async enterSpace(chat_id, twitter_Cookie, proxy){
        const self = this
        const twitterCookie = twitter_Cookie
        const twitterXCSRF = twitterCookie.split('ct0=')[1].split(';')[0]
        const JWT = await (async function getJWT(){
            const headers = {
                headers: {
                    'authority': 'twitter.com',
                    'accept': '*/*',
                    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'referer': 'https://twitter.com/i/spaces/1OwxWwDraZexQ/peek',
                    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-csrf-token': twitterXCSRF,
                    'cookie': twitterCookie,
                    'x-twitter-active-user': 'yes',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'x-twitter-client-language': 'en'
                }
            }
            if(proxy){
                headers['proxy'] = false
                headers['httpsAgent'] = proxy
            }

            try{
                const response = await axios.get('https://twitter.com/i/api/1.1/oauth/authenticate_periscope.json', headers) //502
                return response.data.token
            }
            catch(e){
                if(e.response) {
                    if(e.response.data.errors) {
                        if(e.response.data.errors[0].code){
                            //говнокод починить позже
                            const file = fs.readFileSync('broken.txt').toString()
                            if(!file.includes(proxy.proxy.href)){
                                fs.appendFileSync('broken.txt', `${proxy.proxy.href}\n${twitterCookie}\n${e.response.data.errors[0].message}\n\n`)
                            }
                            
                            return
                        } else {
                            console.log('bebebe')
                            console.log(proxy.proxy.href)
                            console.log(e.response.data)
                            console.log(' ')
                            return e.response.data.errors
                        }
                    }
                    if(e.response.data.toString().includes('407')) {
                        const file = fs.readFileSync('broken.txt').toString()
                        console.log(proxy.proxy.href)
                        if(!file.includes(proxy.proxy.href)){
                            fs.appendFileSync('broken.txt', `${proxy.proxy.href}\n${twitterCookie}\nProxy Authentication Required\n\n`)
                        }
                        // console.log(self.cookieBatch)
                        // const cookieIndex = self.cookieBatch.indexOf(twitterCookie)
                        // const proxieIndex = self.proxieBatch.indexOf(proxy)
                        // if (cookieIndex !== -1) {
                        //     self.cookieBatch.splice(cookieIndex, 1);
                        // }
                        // if (proxieIndex !== -1) {
                        //     self.proxieBatch.splice(proxieIndex, 1);
                        // }      
                    } 
                    else {
                        console.log('azaza')
                        console.log(proxy.proxy.href)
                        console.log(e.response.data)
                        console.log(' ')
                        return e.response
                    }
                } else {
                    fs.appendFileSync('broken.txt', `${proxy.proxy.href} ${e}\n${twitterCookie}\n\n`)
                    console.log(e)
                    return e
                }
            }
        })()

        if(JWT) {
            try{
                if (JWT.includes('message')) {
                    return
                }
            } catch(e) {}

        } else {

            return
        }
        
        if (proxy)
        console.log('получен JWT ' + proxy.proxy.host)
        else console.log('получен JWT ')

        const cookie = await (async function getCookie(){
            const headers = {
                headers: {
                    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                    'sec-ch-ua-mobile': '?0',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                    'content-type': 'application/json',
                    'Referer': 'https://twitter.com/',
                    'X-Attempt': '1',
                    'X-Idempotence': '1670086289945',
                    'X-Periscope-User-Agent': 'Twitter/m5',
                    'x-csrf-token': twitterXCSRF,
                    'cookie': twitterCookie,
                    'sec-ch-ua-platform': '"Windows"'
                }
            }
            if(proxy){
                headers['proxy'] = false
                headers['httpsAgent'] = proxy
            }

            try{
                const response = await axios.post(
                    'https://proxsee.pscp.tv/api/v2/loginTwitterToken',
                    {
                        'jwt': JWT,
                        'vendor_id': 'm5-proxsee-login-a2011357b73e',
                        'create_user': false,
                        'direct': true
                    },
                    headers
                )
                return response.data.cookie
            }
            catch(e){
                console.log(e)
                return
            }
        })()

        if(!cookie)
        return

        if (proxy)
        console.log('получен cookie ' + proxy.proxy.host)
        else console.log('получен cookie ')

        const lifeCycleToken = await (async function accessChat(){
            const headers = {
                params: {
                    'client': 'web',
                    'use_syndication_guest_id': 'false',
                    'cookie_set_host': 'twitter.com'
                },
                headers: {
                    'authority': 'twitter.com',
                    'accept': '*/*',
                    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'referer': 'https://twitter.com/i/spaces/1OwxWwDraZexQ/peek',
                    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                    'x-twitter-active-user': 'yes',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'x-csrf-token': twitterXCSRF,
                    'cookie': twitterCookie,
                    'x-twitter-client-language': 'en'
                }
            }
            if(proxy){
                headers['proxy'] = false
                headers['httpsAgent'] = proxy
            }
            
            try{
                const response = await axios.get(`https://twitter.com/i/api/1.1/live_video_stream/status/${chat_id}`, headers)
                return response.data.lifecycleToken
            }
            catch(e){
                console.log('Еще не началось ' + chat_id)
                return false
            }
        })()

        if(lifeCycleToken === false){
            return
        }

        if (proxy)
        console.log('получен lifecycle ' + proxy.proxy.host)
        else console.log('получен lifecycle ')

        const session = await (async function startWatching(){
            const headers = {
                headers: {
                    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                    'sec-ch-ua-mobile': '?1',
                    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                    'content-type': 'application/json',
                    'Referer': 'https://mobile.twitter.com/',
                    'X-Attempt': '1',
                    'X-Idempotence': '1670086306640',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'x-twitter-active-user': 'yes',
                    'X-Periscope-User-Agent': 'Twitter/video-analytics',
                    'x-csrf-token': twitterXCSRF,
                    'cookie': twitterCookie,
                    'sec-ch-ua-platform': '"Windows"'
                }
            }
            if(proxy){
                headers['proxy'] = false
                headers['httpsAgent'] = proxy
            }

            try{
                const response = await axios.post(
                    'https://proxsee.pscp.tv/api/v2/startWatching',
                    {
                        'life_cycle_token': lifeCycleToken,
                        'auto_play': false,
                        'cookie': cookie
                    },
                    headers,
                    {timeout: 120000}
                )
                return response.data.session
            }
            catch(e){
                const file = fs.readFileSync('broken.txt').toString()
                if(!file.includes(proxy.proxy.href)){
                    if(e.response){
                        fs.appendFileSync('broken.txt', `${proxy.proxy.href}\n${twitterCookie}\n${e.response.data.msg}\n\n`)
                    }
                    else {
                        fs.appendFileSync('broken.txt', `${proxy.proxy.href}\n${twitterCookie}\n${e.response}\n\n`)
                    }
                    
                }
                return
            }
        })()

        if(!session)
        return
        
        return [cookie, session]
    }

    async ping(cookie, session, endTime, twitterCookie, proxy){
        const twitterXCSRF = twitterCookie.split('ct0=')[1].split(';')[0]
        const headers = {
            headers: {
                'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'content-type': 'application/json',
                'Referer': 'https://twitter.com/',
                'X-Attempt': '1',
                'X-Idempotence': '1670086337119',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                'X-Periscope-User-Agent': 'Twitter/video-analytics',
                'cookie': twitterCookie,
                'x-csrf-token': twitterXCSRF,
                'sec-ch-ua-platform': '"Windows"'
            }
        }
        if(proxy){
            headers['proxy'] = false
            headers['httpsAgent'] = proxy
        }
        const interval = setInterval(async () => {
            try{
                await axios.post(
                    'https://proxsee.pscp.tv/api/v2/pingWatching',
                    {
                        'session': session,
                        'cookie': cookie,
                    },
                    headers,
                    {timeout: 60000}
                )

                if (proxy)
                console.log(twitterXCSRF + ' pinged ' + proxy.proxy.host)
                else console.log(twitterXCSRF + ' pinged ')

                if(Date.now() > endTime * 1000){
                    clearInterval(interval)
                }
            }
            catch(e){
                try{
                    if(e.response.data.msg === 'Bad Request'){clearInterval(interval)}
                } catch(e) {
                    if(proxy)
                        console.log(proxy)
                }

                if(e.code){
                    if (proxy)
                    console.log(twitterXCSRF + ' Выходим с трансляции ' + proxy.proxy.host)
                    else console.log(twitterXCSRF + ' Выходим с трансляции ')
                }
            }
        }, 20000) 
    }

    async startWatching(chat_id, twitterCookie, endTimestamp, proxy){
        const interval = setInterval(async()=>{
            let resp = await this.enterSpace(chat_id, twitterCookie, proxy)
            if(resp){
                const [cookie, session] = resp
                await this.ping(cookie, session, endTimestamp, twitterCookie, proxy)
                clearInterval(interval)
            }
            else {
                // console.log(resp, 'тут')
            }
        }, 10000)
    }

    async getTime(event){
        const UNIX = event.startTimestamp
        if(UNIX * 1000 - Date.now() <= 600000){
            if(!this.enteredSpace.includes(event.id)){
                const inviteLink = await this.getInviteLink(event.id)
                if(inviteLink) {
                    if(inviteLink.includes('twitter')){
                        let mediaKey = await this.getMediaKey(inviteLink)
                        if(!this.enteredSpace.includes(mediaKey) && event.endTimestamp * 1000 > Date.now()){
                            console.log('Вступаем в ' + event.title)
                            for (let [index, cookie] of this.cookieBatch.entries()){
                                this.startWatching(mediaKey, cookie, event.endTimestamp, this.proxieBatch[index])
                            }
                            this.enteredSpace.push(mediaKey)
                        }
                        // const [cookie, session] = await this.enterSpace(mediaKey)
                        // setInterval(() => this.ping(cookie, session), 20000)
                        // this.enterSpace.push(event.id)
                    }
                }

                // return inviteLink
            }
        }

        const date = UNIX * 1000 - Date.now()
        if(date > 0){
            let seconds = Math.floor(date / 1000)
            let minutes = Math.floor(seconds / 60)
            let hours = Math.floor(minutes / 60)
            seconds = seconds % 60;
            minutes = minutes % 60;
            hours = hours % 24;
    
            console.log(hours + ':' + minutes + ':' + seconds + ' ' + event.title)
        }
    }

    async main(userResponse){
        if(userResponse.toLowerCase() === 'y'){
            async function foo(_this){
                const allEvents = await _this.myEventsRequest(_this.proxieBatch[0])
                if(allEvents) {
                    for (const event of allEvents){
                        await _this.getTime(event)
                    }
                    console.log('')
                } else {
                    return
                }
            }
            await foo(this)
            setInterval(async() => {
                foo(this)
            }, 30000)  // ПРОВЕРЯЕМ НА НОВЫЕ ИВЕНТЫ
        }

        else{
            async function foo(_this){
                const allEvents = await _this.myEventsRequest()
                for (const [index, event] of allEvents.entries()){
                    await _this.getTime(event)
                }
                console.log('')
            }
            await foo(this)
            setInterval(async() => {
                foo(this)
            }, 30000)  // ПРОВЕРЯЕМ НА НОВЫЕ ИВЕНТЫ 
        }

    }

    constructor(authorization = ''){
        this.authorization = authorization
        this.twitterCookie = ''
        this.twitterXCSRF = ''
        this.enteredSpace = []
        this.cookieBatch = []
        this.proxieBatch = []
        this.userResponse = ''

        this.session = axios.create({
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            }
        })
    }
}
// Объект создается с массива кук твиттера и ОДНОГО КУКИ линк3, когда появляется новое событие ВСЕ аккаунты ТВИТТЕРА по КУКИ и затем ID этого события добавляется в массив УЖЕ ВОЙДЕННЫХ
async function main(){
    const link3Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWE0NTBjMWEtODE0Ny00NjkyLWIyZTctMDBiMzc5N2VjODE4IiwidGVtcF91c2VyIjpmYWxzZSwiZXhwIjoxNjg3MDk5MjU2LCJpYXQiOjE2ODY0OTQ0NTYsImlzcyI6ImxpbmszLnRvIn0.U_PCIZl68St4J4T13CnUK6czZKQmnsVt2ztg3oqN58E'
    
    const link3 = new Link3_checker(
        link3Authorization,
    )

    let rl = readline.createInterface({
        input: fs.createReadStream('twitter_cookies.txt'),
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        link3.cookieBatch.push(line.replace('\n', ''));
    }

    link3.twitterCookie = link3.cookieBatch[0]
    link3.twitterXCSRF = link3.twitterCookie.split('ct0=')[1].split(';')[0]

    link3.userResponse = prompt('Хотите использовать прокси Y/N ? ')

    if(link3.userResponse.toLowerCase() === 'y'){
        console.log('Ставим прокси')
        rl = readline.createInterface({
            input: fs.createReadStream('proxies.txt'),
            crlfDelay: Infinity,
        });
        for await (const line of rl) {
            let proxie = line.replace('\n', '')
            const [ip, port, username, password] = proxie.split(':')
            link3.proxieBatch.push(
                new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
            );
            console.log(`http://${username}:${password}:${ip}:${port}`)
        }
    }

    fs.writeFileSync('broken.txt', '')
    
    link3.main(link3.userResponse)

    // for (const [index, i] of link3.cookieBatch.entries()){
    //     console.log(index)
    //     await link3.startWatching('28_1643392122844839938', i, 1702218131, link3.proxieBatch[index])
    // }

    // await link3.startWatching('28_1636997129473507328', link3.cookieBatch[0], 1692218131, link3.proxieBatch[0])
}
async function start() {
    try {
        await main()
    } catch (e) {
        if(e.response) {
            if(e.response.data) {
                console.log(e.response.data)
            } else {
                console.log(e.response)
            }
        } else {
            console.log(e)
        }
        await start()
    }
}

start()