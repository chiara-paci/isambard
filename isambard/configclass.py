# -*- coding: utf-8 -*-

import os

from microdaemon import configurator,configclass

class Config(configclass.Config):
    BASE_DIR=os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    FAVICON="img/logo-isambard.png" 
    SERVER_NAME="Isambard"
    PORT=8081

    @property
    def PICTURES_DIR(self): return self._db_rel("pictures")

    @property
    def VIDEOS_DIR(self): return self._db_rel("videos")

    @property
    def PRESENTATIONS_DIR(self): return self._db_rel("presentations")

    @property
    def MUSIC_DIR(self): return self._db_rel("music")

    @property
    def PLAYLISTS_DIR(self): return self._db_rel("playlists")

class ConfigCfg(Config):
    PID_SUFFIX="_cfg.pid"
