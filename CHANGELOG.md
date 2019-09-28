## 0.25.86
* Retry message updated
* Retry options in socket (server)
* File manager retry updated
* Errors updated
* SignUp errors updated
* SendMediaMessage API updated
* SendTextMessage API updated
* ReplyMessage API updated

## 0.25.85
* Minor bug fixed

## 0.25.84
* Photo Gallery remove implemented
* Proto Messages updated
* Group Repo getGull updated

## 0.25.83
* Nginx types updated (WASM)

## 0.25.82
* Nginx types updated

## 0.25.81
* Nginx types updated
* More concurrent pipeline in download/upload

## 0.25.80
* Gallery SlideShow implemented
* Proto Messages updated
* Document Viewer updated
* UserInfoMenu view anchor updated
* UserDialog view anchor updated
* Minor bugs fixed

## 0.25.79
* Reply message improvements
* Translations updated
* CachedMessageService event handler added

## 0.25.78
* Prompt in removing message from saved messages updated

## 0.25.77
* ProtoMessages updated
* Client ProtoMessages removed
* Sync mechanism updated
* UpdateNotifySettings improved
* Now you can mute/unmute peers from dialog
* Translations updated
* Instant forward added

## 0.25.76
* Mention Counter and Unread Counter now have more robust checking
* Mention bug fixed
* File manager download queue changed to LIFO

## 0.25.75
* Session reorder updated
* SDK updated

## 0.25.74
* Translations updated
* `ClearDraft` improved
* Chat Updating fixed
* Clear draft after sending if possible
* Focus on scroll added
* Focus at end of input

## 0.25.73
* `ChatInput` send button bug fixed
* `ChatInput` live draft added
* translation updated
* `DialogMessage` draft indicator added
* `MessageStatus` UI bug fixed
* SetLang API added
* Search result improved

## 0.25.72
* Media Uploader bug fixed
* Media reorder bug fixed
* Pending messages improvements
* Swap added in `CachedFileService` for reusing cache 

## 0.25.71
* Worker version updated

## 0.25.70
* Golang updated to 1.13
* wasm_exec.js updated
* wasm binary updated
* workers updated

## 0.25.69
* `GetDialogById` double check added

## 0.25.68
* Draft updated
* Server draft implemented
* Dialog Repo updated
* Proto messages updated
* Translations updated
* Dialog search now shows contacts as well
* UpdateManger updated
* SyncManger updated

## 0.25.67
* Mention bug fixed
* `MessagePreview` UI bug fixed
* `MessageForward` UI bug fixed
* Iframe service log removed
* Now it ignores outdated counter update
* ReactMentions updated

## 0.25.66
* Code len updated to 5 digits

## 0.25.65
* Static map updated to Yandex(TM)
* Map viewer background color updated

## 0.25.64
* AudioPlayer next and previous implemented
* Typings interval constant added
* Max height added to chips container
* Map picker translation updated
* Translations updated
* Uploading doc status added
* AudioPlayer bug fixed

## 0.25.63
* MD5 bug fixed

## 0.25.62
* Toggle menu bar removed in macOS

## 0.25.61
* Last seen recently updated
* MessageReadInbox bug updated
* Recording bug fixed

## 0.25.60
* AuthRecall bug fixed

## 0.25.59
* SDK AuthRecall updated

## 0.25.58
* UI bug fixed
* User is_contact modified
* User phone added

## 0.25.57
* Now you can add group photo on create
* Edit bug fixed
* Edit avatar bug fixed
* Translation bug fixed
* Logs added for file error
* CachedPhoto bug fixed
* Document zoom updated

## 0.25.56
* Active sessions updated

## 0.25.55
* Checksum validation to file manager
* File repository updated
* CachedPhoto mimeType and md5 implemented
* CachedVideo mimeType and md5 implemented
* Call removed from privacy and security
* Uploader document updated
* Protobuffs updated
* Video thumbnail quality improved
* Unread counter data race bug fixed and patched

## 0.25.54
* PeerMedia video thumbnail bug fixed
* Privacy and Security added
* Settings menu rewrite
* Translations updated
* Proto Messages updated
* SDK updated
* User server's phone bug fixed
* User dialog typo fixed
* Last seen in group user count localized
* UserList component added
* Farsi translation updated
* User repo updated (get in Ids)
* Set and Get privacy with diff added

## 0.25.53
* Group permission updated
* Remove group photo added
* New loading page
* Message notification bug fixed

## 0.25.52
* Scroll improved
* Attempt to fix unread counters on sync
* Dialog force render on updateOutBox added

## 0.25.51
* Unread counter improvements

## 0.25.50
* Downloaded thumbnail is now have better quality 

## 0.25.49
* Protobuff updated
* Send as SMS added
* Message resize event added

## 0.25.48
* Blink on reply bug fixed

## 0.25.47
* File download/upload pipeline bug fixed
* Unread counter clearTimeout bug fixed

## 0.25.46
* Clear history scroll position bug fixed

## 0.25.45
* Unread counter: (multiple timeout checker)
* New pipeline for thumbnails
* Bug fixed in blurred `CachedPhoto`
* `UserGetFull` with cached first added in `UserDialog` and `UserInfoMenu`
* Upload file bug fixed
* Prevent set typing in saved messages and river official account
* Audio player improved
* Playlist bug fixed
* Duration health check added
* Headphone Play\Pause events are now being applied

## 0.25.44
* Max-width will be applied on media messages

## 0.25.43
* Max-width set to 256px add message cell

## 0.25.42
* Electron updated
* Single instance app added
* Dark mode in macOS added
* Toggle menubar option added

## 0.25.41
* `Try again` added in connecting status
* Translations updated
* Waiting for network indicator improved

## 0.25.40
* Bad network bug fixed

## 0.25.39
* Emoji on simplified view fixed 

## 0.25.38
* Emoji magnifier added
* Cell height cache updated
* Websocket connecting bug fixed
* Unread counter: read on other device bug fixed

## 0.25.37
* File log added
* Websocket bug fixed

## 0.25.36
* Cache size bug fixed

## 0.25.35
* Jump on scroll bug fixed
* File manager on http fixed
* Pre-Cache height improved 
* Change-logs.md renamed to CHANGELOG.md

## 0.25.34
* Message media updated
* requestAnimationFrame added instead of timeout for scrolling
* Waiting for network status added
* Network connection updated
* Unread counters now have confirmation
* Translations updated

## 0.25.33
* Un-downloaded Message Media appearance updated

## 0.25.32
* Message load more after bug fixed
* Close wire improved

## 0.25.31
* Header removed (Sec-WebSocket-Protocol: web-client)

## 0.25.30
* Deleted reply message will be removed after second time
* Logs added 
* Dev tools added to electron app
* Idle connection improved
* Header added (Sec-WebSocket-Protocol: web-client)

## 0.25.29
* Dialog sort bug fixed

## 0.25.28
* Now we detect network change (VPN use)

## 0.25.27
* Blink on first load bug fixed

## 0.25.26
* Scrollbar width on small dialogs fixed

## 0.25.25
* Nginx expire header updated
* Voice player bug fixed on send
* Browser background updated with the official pattern
* Now it asks to cancel recording on dialog switching
* Get client height bug fixed 