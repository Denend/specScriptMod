import axios, { AxiosInstance } from "axios";

export type event = {
    id: string,
    title: string,
}

export class CyberConnect {
    private instance: AxiosInstance
    constructor(
        private authToken: string
    ) {
        this.instance = axios.create({
            headers: {
                'authority': 'api.cyberconnect.dev',
                'accept': '*/*',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': authToken,
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
        })
    }

    async fetchEvent(): Promise<event[]> {
        const response: [] = await this.instance.post(
            'https://api.cyberconnect.dev/profile/',
            {
              'query': '\n    query getTrendingEvents($first: Int, $after: String, $order: TrendingEventsRequest_EventOrder, $filter: TrendingEventsRequest_EventFilter) {\n  trendingEvents(first: $first, after: $after, order: $order, filter: $filter) {\n    pageInfo {\n      ...PageInfo\n    }\n    list {\n      id\n      info\n      title\n      posterUrl\n      startTimestamp\n      endTimestamp\n      registrantsCount\n      registerStatus\n      status\n      organizer {\n        ...Organizer\n      }\n      lightInfo {\n        hasRaffle\n        hasW3ST\n      }\n    }\n  }\n}\n    \n    fragment PageInfo on PageInfo {\n  startCursor\n  endCursor\n  hasNextPage\n  hasPreviousPage\n}\n    \n\n    fragment Organizer on Organization {\n  twitterId\n  id\n  followersCount\n  verification\n  currentAccess\n  lightInfo {\n    isFollowing\n    displayName\n    profilePicture\n    profileHandle\n  }\n}\n    ',
              'variables': {
                'after': '',
                'order': 'START_TIME_ASC'
              },
              'operationName': 'getTrendingEvents'
            },
        ).then(response => response.data.data.trendingEvents.list)

        const events = response.filter((event: any) => {
            // console.log(Math.round(Date.now()/ 1000) - event.startTimestamp)
            // console.log(event.startTimestamp - Math.round(Date.now()/ 1000))
            const time = 3 * 1000
            if(event.lightInfo.hasW3ST && event.startTimestamp - Math.round(Date.now()/ 1000) < time) {
            // if(event.lightInfo.hasW3ST) {
                return event
            }
        })
        return events
    }

    async getTwitterLink(id: string, title?: string): Promise<string> {
        const response = await axios.post(
            'https://api.cyberconnect.dev/profile/',
            {
              'query': '\n    query getEventViewData($id: ID!) {\n  event(id: $id) {\n    __typename\n    id\n    title\n    info\n    recap\n    posterUrl\n    startTimestamp\n    endTimestamp\n    timezone\n    registerStatus\n    status\n    speakers {\n      ...Speaker\n    }\n    organizer {\n      twitterId\n      id\n      followersCount\n      verification\n      currentAccess\n      lightInfo {\n        profileHandle\n        isFollowing\n        displayName\n        profilePicture\n      }\n    }\n    w3st {\n      ...W3stOnEventViewPage\n    }\n    registrantsCount\n    registrants(first: 7) {\n      pageInfo {\n        ...PageInfo\n      }\n      list {\n        lightInfo {\n          handle\n          avatar\n          avatarFrameTokenId\n          displayName\n          formattedAddress\n        }\n      }\n    }\n    raffle {\n      ...Raffle\n    }\n    location {\n      __typename\n      ...TwitterSpaceEvent\n      ...DiscordEvent\n      ... on DiscordEvent {\n        inviteLink\n      }\n      ...OtherEvent\n    }\n    tags\n    language\n    recapLikeInfo {\n      likedCount\n      isLiked\n    }\n    registrantsTokenHoldings {\n      collection\n      logo\n      ownedCount\n      ownersCount\n    }\n  }\n}\n    \n    fragment Speaker on EventSpeaker {\n  twitterId\n  twitterHandle\n  displayName\n  avatar\n  title\n  profileId\n  twitterFollowers\n  avatarFrameTokenId\n}\n    \n\n    fragment W3stOnEventViewPage on W3ST {\n  gasless\n  imageUrl\n  contractInfo {\n    deployStatus\n    chainId\n    essenceAddress\n    tokenHoldersCount\n  }\n  requirements {\n    type\n    value\n  }\n}\n    \n\n    fragment PageInfo on PageInfo {\n  startCursor\n  endCursor\n  hasNextPage\n  hasPreviousPage\n}\n    \n\n    fragment Raffle on Raffle {\n  awards {\n    ...TokenAward\n    ...CodeAward\n  }\n  tweetUrl\n  joinStatus {\n    status\n    myAward\n  }\n  winnersCount\n  joinedCount\n  claimDeadline\n  participateDeadline\n  requirement {\n    retweet\n    follow\n    comment\n    likeAndRetweet\n    tag\n    multiFollow\n    twittersToFollow {\n      twitterId\n      twitterHandle\n    }\n  }\n}\n    \n    fragment TokenAward on TokenAward {\n  chainId\n  tokenIcon\n  symbol\n  contractAddress\n  amount\n}\n    \n\n    fragment CodeAward on CodeAward {\n  code\n  description\n}\n    \n\n    fragment TwitterSpaceEvent on TwitterSpaceEvent {\n  link\n}\n    \n\n    fragment DiscordEvent on DiscordEvent {\n  server\n  serverName\n  channel\n  channelName\n  autoSync\n}\n    \n\n    fragment OtherEvent on OtherEvent {\n  link\n}\n    ',
              'variables': {
                'id': id
              },
              'operationName': 'getEventViewData'
            },
        )
        return response.data.data.event.location.link
    }
}