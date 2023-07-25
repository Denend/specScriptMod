import axios, { AxiosError } from "axios"
import HttpsProxyAgent from 'https-proxy-agent';

export let headers = {
    'authority': 'twitter.com',
    'accept': '*/*',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
    'cache-control': 'no-cache',
    'cookie': '',
    'pragma': 'no-cache',
    'referer': 'https://twitter.com/i/spaces/1YpKkgEplpAKj/peek',
    'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
    'x-csrf-token': '',
    'x-twitter-active-user': 'yes',
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-client-language': 'en'
}

export class Twitter {
    private static async getMediaKey(cookie: string, twitterLink: string, proxy: string): Promise<string> {
        try {
            const [ip, port, username, password] = proxy.split(':')
            const id = twitterLink.split('spaces/')[1]
            
            const response = await axios.get('https://twitter.com/i/api/graphql/I-a0aEU_NFrl-zpeR0GeSg/AudioSpaceById', {
                params: {
                    'variables': `{"id": "${id}","isMetatagsQuery":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withReplays":true}`,
                    'features': '{"spaces_2022_h2_clipping":true,"spaces_2022_h2_spaces_communities":true,"blue_business_profile_image_shape_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_richtext_consumption_enabled":false,"responsive_web_enhance_cards_enabled":false}'
                },
                headers: {
                    ...headers,
                    cookie: cookie,
                    'x-csrf-token': cookie.split('; ct0=')[1].split('; ')[0]
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
            })

            if(!response.data.data)
                throw new Error('getMediaKey ' + response.data) 
            return response.data.data.audioSpace.metadata.media_key
        } catch(e: any) {
            if(!e.response)
                throw new Error('getMediaKey ' + e)
            if(!e.response.data) {
                throw new Error(`getMediaKey ${e.response.status} ${e.response.statusText}`)
            }

            throw new Error(`${JSON.stringify(e.response.data)} ${cookie.split('; ct0=')[1].split('; ')[0]}`)
        }
    }

    static async getJWT(cookie: string, proxy: string): Promise<string> {
        try {
            const [ip, port, username, password] = proxy.split(':')
            const response = await axios.get('https://twitter.com/i/api/1.1/oauth/authenticate_periscope.json', {
                headers: {
                    ...headers,
                    cookie: cookie,
                    'x-csrf-token': cookie.split('; ct0=')[1].split('; ')[0]
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
            })
            if(!response.data)
                throw new Error('getJWT ' + response) 
            if(!response.data.token)
                throw new Error('getJWT ' + response.data ) 
            return response.data.token
        } catch(e: any) {
            if(!e.response)
                throw new Error('getJWT ' + e)
            if(!e.response.data)
                throw new Error('getJWT ' + e.response)
            throw new Error(`getJWT ${JSON.stringify(e.response.data)}`)
        }
    }

    static async getCookie(jwt: string, proxy: string): Promise<string> {
        try {
            const [ip, port, username, password] = proxy.split(':')
            const response = await axios.post(
                'https://proxsee.pscp.tv/api/v2/loginTwitterToken',
                {
                  'jwt': jwt,
                  'vendor_id': 'm5-proxsee-login-a2011357b73e',
                  'create_user': false,
                  'direct': true
                },
                {
                    headers: {...headers},
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
                }
            )

            if(!response.data.cookie)
                throw new Error('getCookie' + response.data)  
            return response.data.cookie
        } catch(e: any) {
            if(!e.response)
                throw new Error('getCookie' + e)
            if(!e.response.data)
                throw new Error('getCookie' + e.response)
            throw new Error('getCookie' + JSON.stringify(e.response.data))
        }
    }

    static async getLifeCycleToken(cookie: string, twitterLink: string, proxy: string): Promise<string> {
        try {
            const [ip, port, username, password] = proxy.split(':')
            const media_key = await this.getMediaKey(cookie, twitterLink, proxy)
    
            const response = await axios.get(`https://twitter.com/i/api/1.1/live_video_stream/status/${media_key}`, {
                params: {
                    'client': 'web',
                    'use_syndication_guest_id': 'false',
                    'cookie_set_host': 'twitter.com'
                },
                headers: {
                    ...headers,
                    cookie: cookie,
                    'x-csrf-token': cookie.split('; ct0=')[1].split('; ')[0]
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
            })
    
            if(!response.data)
                throw response
            if(!response.data.lifecycleToken)
                throw response.data 
            return response.data.lifecycleToken
        } catch(e: any) {
            if(!e.response)
                throw new Error('getLifeCycleToken ' + e)
            if(!e.response.data) {
                if(e.response.status == 404) throw new Error(`Не началось`)
                // throw `не началось`
                // console.log(e.response.status)
                throw new Error('getLifeCycleToken ' + e.response)
            }
            throw new Error('getLifeCycleToken ' + JSON.stringify(e.response.data))
        }
    }

    static async startWatching(cookie: string, audioCookie: string, lifeCycleToken: string, proxy: string): Promise<string> {
        try {
            const [ip, port, username, password] = proxy.split(':')
            const response = await axios.post(
                'https://proxsee.pscp.tv/api/v2/startWatching',
                {
                  'life_cycle_token': lifeCycleToken,
                  'auto_play': false,
                  'cookie': audioCookie
                },
                {
                  headers: {
                    ...headers,
                    cookie: cookie,
                    'x-csrf-token': cookie.split('; ct0=')[1].split('; ')[0]
                  },
                  proxy: false,
                  httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
                }
            )

            if(!response.data.session)
                throw new Error('startWatching ' + response.data) 
            return response.data.session
        } catch(e: any) {
            if(!e.response)
                throw new Error('startWatching ' + e)
            if(!e.response.data)
                throw new Error('startWatching ' + e.response)
            throw new Error('startWatching ' + JSON.stringify(e.response.data))
        }
    }

    static async ping(cookie: string, audioCookie: string, session: string, proxy: string, title: string, callback: (message: string)=>any) {
        const inerval = setInterval(async () => {
            try {
                const [ip, port, username, password] = proxy.split(':')
                const response = await axios.post(
                    'https://proxsee.pscp.tv/api/v2/pingWatching',
                    {
                        'session': session,
                        'cookie': audioCookie
                    },
                    {
                        headers: {
                            ...headers,
                            cookie: cookie,
                            'x-csrf-token': cookie.split('; ct0=')[1].split('; ')[0]
                        },
                        proxy: false,
                        httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${username}:${password}@${ip}:${port}`)
                    }
                );
                // console.log(cookie.split('; ct0=')[1].split('; ')[0])
                // return cookie.split('; ct0=')[1].split('; ')[0]
                callback(cookie.split('; ct0=')[1].split('; ')[0])
                // console.log(`${cookie.split('; ct0=')[1].split('; ')[0]} - pinged ${title}`)
            } catch(e: any) {
                switch(true) {
                    case e.response && e.response.data && e.response.data.success === false:
                        console.log('Выходим')
                        clearInterval(inerval)
                        break
                    case e.response && e.response.data && e.response.data.cause:
                        console.log(e.response.data.cause)
                        break
                    case e.response && e.response.data:
                        console.log(e.response.data)
                        break
                    case e.response:
                        console.log(e.response)
                        break
                    default:
                        console.log(e)
                        break
                }
            }
        }, 40_000)
    }        
}