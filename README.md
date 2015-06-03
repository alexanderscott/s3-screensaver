# s3-screensaver
Host an interactive gallery of photos from an s3 bucket.

Uses the AWS SDK to retrieve photos from a provided bucket, and return them to a web client.  The web client uses [isotope](http://isotope.metafizzy.co/) to arrange the photos into a collage.  


## Install
```
npm install -g s3-screensaver
```

## Configure
Create an IAM user and attach a policy that allows `ListObjects` and `GetObject` on the target S3 Bucket.

Insert AWS region, S3 bucket name, and that user's access key and secret key into a file `~/.s3-screensaver`:
```
echo "[S3 bucket name]" > ~/.s3-screensaver
echo "[AWS region (ex/ us-west-2)]" >> ~/.s3-screensaver
echo "[IAM access key id]" >> ~/.s3-screensaver
echo "[IAM secret access key]" >> ~/.s3-screensaver
```


## Run
```
s3-screensaver [options]
```

#### Options

    -h, --help              output usage information
    -V, --version           output the version number
    -p, --port              Specify port to host the server (default 3000)
    --loglevel              Specify a loglevel for the server (default INFO)
    --display-interval      Frequency to check for new photos
    --shuffle-interval      Frequency to shuffle the displayed images (0 for no shuffle)
    --display-count         Number of images to display
    --display-style         Style of image display ("grid" or "single")



## License

MIT License

Copyright (c) 2015 Alex Ehrnschwender (http://alexehrnschwender.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



