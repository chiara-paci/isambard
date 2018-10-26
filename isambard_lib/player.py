import os
import pyglet
import random
import math

from . import abstracts,config

class PlayObjectCollection(abstracts.ObjectCollection): 
    def infinite(self): return abstracts.InfiniteLoop(self)

class Video(object):
    def __init__(self,conf):
        self.object_id=conf["label"]
        self._path=os.path.join(config.VIDEOS_DIR,conf["path"])
        self.window=None
        self.source=None
        self._player=None

    @property
    def playing(self): 
        if self._player is None: return False
        return self._player.playing

    def dismiss(self):
        del self.source
        del self._player
        self.source=None
        self.window=None
        self._player=None


    def setup(self,window):
        self.window=window
        self.source = pyglet.media.load(self._path)
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
        if self._player.playing:
            self._player.get_texture().blit(self._x,self._y,width=self._width,height=self._height)

    def play(self):
        self._player.play()

class PhotoShow(object):
    def __init__(self,conf):
        self.object_id=conf["label"]
        self._image_count=int(conf["image_count"])
        self._image_rate=float(conf["image_rate"])
        self._frame_per_second=float(conf["frame_per_second"])
        self._update_rate=1/self._frame_per_second
        self._num_steps=int(math.ceil(self._image_rate*self._frame_per_second))
        self._music_list=[ os.path.join(config.MUSIC_DIR,f) for f in conf["music_list"] ]
        self._list=[ os.path.join(config.PICTURES_DIR,f) for f in conf["list"] ]
        self._image_ind=0

        self.sprite=None
        self.window=None
        self._player=None

    @property
    def playing(self): 
        if self._player is None: return False
        return (self._image_ind<=self._image_count) and self._player.playing 

    def dismiss(self):
        del self.sprite
        del self._player
        self.sprite=None
        self.window=None
        self._player=None
        pyglet.clock.unschedule(self._update_image)
        pyglet.clock.unschedule(self._update_view)

    def setup(self,window):
        self.window=window
        self.update(self._list[0])
        self._player = pyglet.media.Player()
        self._player.push_handlers(self.window)
        for mpath in self._music_list:
            source = pyglet.media.load(mpath)
            self._player.queue(source)

    def update(self,path):
        self._x_speed     = random.randint(1, 8)
        self._y_speed     = random.randint(1, 8)
        self._scale_speed = random.uniform(0.0, 0.03)
        self._x_speed *= random.choice([-1,1])
        self._y_speed *= random.choice([-1,1])
        self._scale_speed *= random.choice([-1,1])

        img = pyglet.image.load(path)
        if self.sprite is None:
            self.sprite = pyglet.sprite.Sprite(img)
        else:
            self.sprite.image = img

        W=self.window.width
        H=self.window.height
        w=img.width
        h=img.width

        NU=self._num_steps*self._update_rate

        x_0=int(math.floor(min(0,-NU*self._x_speed)))
        y_0=int(math.floor(min(0,-NU*self._y_speed)))

        scale_0=max( (W-x_0)/w,
                     (H-y_0)/h,
                     (W-x_0-NU*self._x_speed)/w-NU*self._scale_speed,
                     (H-y_0-NU*self._y_speed)/h-NU*self._scale_speed )

        self.sprite.x = x_0 #0
        self.sprite.y = y_0 #0
        self.sprite.scale = scale_0 #self._get_scale()

    def _update_view(self,dt):
        self.sprite.x += dt * self._x_speed
        self.sprite.y += dt * self._y_speed
        self.sprite.scale += dt * self._scale_speed

    def _update_image(self,dt):
        path=random.choice(self._list)
        self.update(path)
        self._image_ind+=1
        self.window.clear()

    def play(self):
        pyglet.clock.schedule_interval(self._update_image, self._image_rate)
        pyglet.clock.schedule_interval(self._update_view, self._update_rate)
        self._player.play()

    def draw(self):
        if self.sprite is not None:
            self.sprite.draw()

class IsambardPlayer(object):
    def __init__(self,db,bus,playlist):
        self.db=db
        self.bus=bus
        self._playlist=PlayObjectCollection(db.playlists[playlist])
        self._playlist_iterator=self._playlist.infinite()
        self._current=None

    def _play_next(self):
        obj=next(self._playlist_iterator)
        obj.setup(self._window)
        if self._current is not None:
            self._current.dismiss()
        self._current=obj
        obj.play()
        self._draw()

    def _update(self,dt):
        if self._current is None:
            self._play_next()
            return
        if self._current.playing: return
        self._play_next()

    def start(self):
        window = pyglet.window.Window(fullscreen=True)
        @window.event
        def on_draw():
            self._draw()
        self._window=window
        pyglet.clock.schedule(self._update)
        pyglet.app.run()

    def _draw(self):
        self._window.clear()
        if self._current is not None:
            self._current.draw()


