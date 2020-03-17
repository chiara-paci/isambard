# -*- coding: utf-8 -*-

""" Isambard server, the main isambard object. """

import socketio
import eventlet
import eventlet.wsgi
import urllib.parse
import collections
import mimetypes
import logging

mimetypes.add_type('application/json',".map")
mimetypes.add_type('application/x-font-woff2',".woff2")
mimetypes.add_type('application/x-font-opentype',".otf")
mimetypes.add_type('application/x-font-truetype',".ttf")
mimetypes.add_type('text/x-less',".less")

from . import pages

from microdaemon import common,threads,channels,config

from microdaemon.server import request as reqmodule
from microdaemon.server import pages as mdpages

from microdaemon.server import server,exceptions

logger_onshow=logging.getLogger("%s.onshow" % __name__)

class IsambardServer(server.Server):
    """Main Isambard object. 

    *bus* (channels.Bus)
        Communication bus common to all objects.
    *port* (int)
        Port to bind.
    *host* (str)
        Host to bind.

    A  `IsambardServer` object  is  the interface  between user  and
    other components of Isambard. It  run a WSGI server listening on
    host *host* and port *port* (default 7373 on localhost).  The user
    can connect with a  browser to "http://*host*:*port*" and interact
    in this way.

    Attributes:
        *bus* (channels.Bus)
            Communication bus common to all objects.

    """

    class InfoNamespace(server.Server.InfoNamespace):
        def on_connect(self,sid, environ):
            server.Server.InfoNamespace.on_connect(self,sid, environ)
            self.emit("init_onshow",self._server.db.onshow,room=sid)

    def __init__(self,db,bus,host="localhost",port=7373):
        server.Server.__init__(self,bus,host=host,port=port)
        self.db=db 
        self.welcome_message="Isambard %s Started on http://%s:%d/ with %s" % (config.VERSION,
                                                                               self._http_host,
                                                                               self._http_port,
                                                                               self.db)

        th=threads.WhileTrueThread(target=self._thread_onshow,name="OnShowThread")
        th.start()

    def _thread_onshow(self):
        msg=self.bus["onshow"].read_message(block=True)
        if msg is None: return
        log_time=common.utc_now()
        onshow=msg[0]
        self.db.onshow.append( (log_time,onshow) )
        logger_onshow.info("[%s] %s" % (log_time,onshow))
        if "browser/info" in self.bus:
            self.bus["browser/info"].send_message("onshow",(log_time,onshow))

    def page_factory(self,request):
        if len(request.path_split)==0: 
            return pages.HomePage(self)

        if len(request.path_split)==1:
            for target,p_class,collection in [ ("pictures",mdpages.MediaCollectionPage,self.db.pictures),
                                               ("videos",mdpages.MediaCollectionPage,self.db.videos),
                                               ("music",mdpages.MediaCollectionPage,self.db.music) ]:
                if request.path_split[0] == target:
                    return p_class(self,collection)

            # for p,p_class in [ ( "showlist", pages.ShowListPage  ) ]:
            #     if request.path_split[0] == p:
            #         return p_class(self)
            return server.Server.page_factory(self,request)

        if len(request.path_split)==2:
            if request.path_split[0] not in ["pictures","videos","music"]:
                return server.Server.page_factory(self,request)
            object_id=request.path_split[1]
            for target,p_class,collection in [ ("pictures",mdpages.PictureObjectPage,self.db.pictures),
                                               ("videos",mdpages.VideoObjectPage,self.db.videos),
                                               ("music",mdpages.MusicObjectPage,self.db.music) ]:
                if request.path_split[0]==target:
                    try:
                        obj=collection[object_id]
                    except KeyError as e:
                        raise exceptions.Http404NotFound(request)
                    return p_class(self,obj)

        if len(request.path_split)==3:
            if request.path_split[0] not in ["pictures","videos","music"]:
                return server.Server.page_factory(self,request)
            if request.path_split[2]!="thumbnail.jpeg":
                return server.Server.page_factory(self,request)
            object_id=request.path_split[1]
            for target,p_class,collection in [ ("pictures",mdpages.ThumbnailPage,self.db.pictures),
                                               ("videos",mdpages.ThumbnailPage,self.db.videos),
                                               ("music",mdpages.ThumbnailPage,self.db.music) ]:
                if request.path_split[0]==target:
                    try:
                        obj=collection[object_id]
                    except KeyError as e:
                        raise exceptions.Http404NotFound(request)
                    return p_class(self,obj)

        return server.Server.page_factory(self,request)



