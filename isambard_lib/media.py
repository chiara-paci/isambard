import pyglet

class Video(object):
    def __init__(self,window,path):
        self.window=window
        self.source = pyglet.media.load(path)
        self._resize()
        self._player = pyglet.media.Player()
        self._player.push_handlers(self.window)
        self._player.queue(self.source)

    def _resize(self):
        video_format = self.source.video_format
        w = video_format.width
        h = video_format.height
        W=self.window.width
        H=self.window.height

        scale=min(W/w,H/h)
        self._width=scale*w
        self._height=scale*h
        self._x=(W-self._width)/2
        self._y=(H-self._height)/2

    def draw(self):
        self._player.get_texture().blit(self._x,self._y,width=self._width,height=self._height)

    def play(self):
        self._player.play()

