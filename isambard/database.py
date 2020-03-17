from microdaemon import config
from microdaemon.database import models,datatype
        
class IsambardDatabase(models.Database):
    def __init__(self,configuration_file):
        models.Database.__init__(self,configuration_file)

        self.pictures=datatype.PictureCollection(config.PICTURES_DIR)
        self.videos=datatype.VideoCollection(config.VIDEOS_DIR)
        self.music=datatype.MusicCollection(config.MUSIC_DIR)
        self.playlists=datatype.PlaylistCollection(config.PLAYLISTS_DIR)

