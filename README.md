# Scrum Poker
So, why does the world need another scrum poker tool. Well, it doesn't. I just wanted to make one. It sounded like a fun way to look at SSE and Node.js and what ever else tickles my fancy along the way. So I better get some idea of what I want to accomplish here...
## Planning

*Goals*
* track this data
  * game - this connects all players and hands
  * hand - a collection of bids for one item
  * bids - individual rating for an item
  * players - by email

*Screens*
* home
  * login - use email
  * start a game
  * join a game
* bidding 
  * (re)select a bid
  * start a hand (owner) - set title; start
  * view bidding users - watch incoming bids by user; values hidden
  * "call" a hand (owner) -  freeze a hand; revealing bids
  * close a hand (owner) - record bid (must be unanimous); clear bidding screen
  * end game
  * show results
* results
  * list 'hands' with bids
  * total