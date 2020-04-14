export const getCodec = (mime: string, file: File): Promise<string> => {
    // @ts-ignore
    if (!file.arrayBuffer) {
        return Promise.resolve(mime);
    }
    return new Promise((resolve) => {
        file.slice(0, 256 * 1024);
        const validTypes = [
            'video/webm; codecs="vp8, vorbis"',              // WebM, VP8, Vorbis
            'video/webm; codecs="vp9, vorbis"',              // WebM, VP9, Vorbis
            'video/mp4; codecs="avc1.66.13,  mp4a.40.2"',    // MPEG4, AVC(H.264) Baseline 1.3, AAC-LC, [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.42e01e, mp4a.40.2"',    // MPEG4, AVC(H.264) Baseline 1.3, AAC-LC, [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.66.30,  mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.0, AAC-HC, [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.42001e, mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.0, AAC-HC, [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.42001f, mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.1, AAC-HC, [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.77.30,  mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.0, AAC-HC,     [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.4d001e, mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.0, AAC-HC,     [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.4d001f, mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.1, AAC-HC,     [MPEG-4 AVC/H.264]
            'video/mp4; codecs="avc1.640029, mp4a.40.5"',    // MPEG4, AVC(H.264) High 4.1, AAC-HC,     [MPEG-4 AVC/H.264]
            'video/mp4; codecs="mp4a.40.2"',
            'video/mp4; codecs="avc1.4d001e, mp4a.40.2"',    // MPEG4 AVC(H.264) Main 3.0, AAC-LC
            'video/mp4; codecs="mp4v.20.8, mp4a.40.3"',      // mp4, mpeg4 visual, mp3
            'video/mp4; codecs="mp4v.20.8, samr"',           // mp4(3gp), mpeg4 visual, amr
        ].filter((o) => {
            return o.indexOf(mime) === 0;
        });
        // @ts-ignore
        file.arrayBuffer().then((buffer) => {
            fn(buffer, 0);
        });

        const fn = (buffer: ArrayBuffer, i: number) => {
            const video = document.createElement('video');
            const mediaSource = new MediaSource();
            video.src = URL.createObjectURL(mediaSource);
            mediaSource.onsourceopen = () => {
                URL.revokeObjectURL(video.src);
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer(validTypes[i]);
                    sourceBuffer.appendBuffer(buffer);
                    sourceBuffer.onupdateend = () => {
                        if (!video.error) {
                            resolve(validTypes[i]);
                        } else {
                            i++;
                            if (validTypes.length > i) {
                                fn(buffer, i);
                            } else {
                                resolve(mime);
                            }
                        }
                    };
                } catch (e) {
                    i++;
                    if (validTypes.length > i) {
                        fn(buffer, i);
                    } else {
                        resolve(mime);
                    }
                }
            };
        };
    });
};

export const transformMimeType = (mimeType: string) => {
    switch (mimeType) {
        case 'video/mp4':
            return 'video/mp4; codecs="avc1.64001E,mp4a.40.2"';
        case 'audio/aac; codecs="H.264"':
            return 'video/mp4; codecs="avc1.4d401f,mp4a.40.2"; profiles="isom,mp42"';
        case 'video/webm':
            return 'video/webm; codecs="vorbis,vp8"';
    }
    return mimeType;
};