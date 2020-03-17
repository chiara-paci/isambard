# -*- coding: utf-8 -*-

from microdaemon.server import pages

class HomePage(pages.HomePage):
    def get_context(self,request):
        context=pages.HomePage.get_context(self,request)
        context["onshow"]=self._server.db.onshow
        return context
