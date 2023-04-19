import SettingService from '@/services/SettingService'
import FollowListService from '@/services/FollowListService'
import LivePlayService from '@/services/LivePlayService'
import SearchHistoryService from '@/services/SearchHistoryService'
import RoomService from '@/services/RoomService'

import CDNListener from '@/services/listeners/CDNListener'
import NoticeListener from '@/services/listeners/NoticeListener'
import PlayerWindowCountListener from '@/services/listeners/PlayerWindowCountListener'
import VtbInfoUpdateListener from '@/services/listeners/VtbInfoUpdateListener'
import AppUpdateListener from '@/services/listeners/AppUpdateListener'

export {
  SettingService,
  FollowListService,
  LivePlayService,
  SearchHistoryService,
  RoomService,
  CDNListener,
  NoticeListener,
  VtbInfoUpdateListener,
  PlayerWindowCountListener,
  AppUpdateListener,
}
