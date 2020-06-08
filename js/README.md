## dev

`python -m http.server 8888` -> open `localhost:8888`

## video/ffmpeg commands:

Generate list of thumbnails
`ffmpeg -i 03_CollegeAction.mp4 -vf fps=1,scale=240:-1 -vsync vfr -f image2 ./output/03/thumbs/%04d_thumb.jpg`
Combine them into 8x4 tiled images
`montage ./output/03/thumbs/*.jpg -geometry +0+0 -tile 8x4 -quality 25 ./output/03/03_thumbs.jpg`
Create 720p file
`ffmpeg -i 03_CollegeAction.mp4 -vf scale=-1:720 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_720.mp4`
Create 480p file
`ffmpeg -i 03_CollegeAction.mp4 -vf scale=854:480 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_480.mp4`
Create 360p file
`ffmpeg -i 03_CollegeAction.mp4 -vf scale=-1:360 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_360.mp4`
Compress the original 1080p file
`ffmpeg -i 03_CollegeAction.mp4 -vcodec h264 -acodec aac 03_CollegeAction_compressed.mp4`
Compress the 720p file
`ffmpeg -i ./output/03/03_CollegeAction_720.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_720_compressed.mp4`
Compress the 480p file
`ffmpeg -i ./output/03/03_CollegeAction_480.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_480_compressed.mp4`
Compress the 360p file
`ffmpeg -i ./output/03/03_CollegeAction_360.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_360_compressed.mp4`

All together:
```
ffmpeg -i 03_CollegeAction.mp4 -vf fps=1,scale=240:-1 -vsync vfr -f image2 ./output/03/thumbs/%04d_thumb.jpg &&
montage ./output/03/thumbs/*.jpg -geometry +0+0 -tile 8x4 -quality 25 ./output/03/03_thumbs.jpg &&
ffmpeg -i 03_CollegeAction.mp4 -vf scale=-1:720 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_720.mp4 &&
ffmpeg -i 03_CollegeAction.mp4 -vf scale=854:480 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_480.mp4 &&
ffmpeg -i 03_CollegeAction.mp4 -vf scale=-1:360 -c:v libx264 -crf 18 -preset veryslow -c:a copy ./output/03/03_CollegeAction_360.mp4 &&
ffmpeg -i 03_CollegeAction.mp4 -vcodec h264 -acodec aac 03_CollegeAction_compressed.mp4 &&
ffmpeg -i ./output/03/03_CollegeAction_720.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_720_compressed.mp4 &&
ffmpeg -i ./output/03/03_CollegeAction_480.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_480_compressed.mp4 &&
ffmpeg -i ./output/03/03_CollegeAction_360.mp4 -vcodec h264 -acodec aac ./output/03/03_CollegeAction_360_compressed.mp4 &&
echo "DONE"
```