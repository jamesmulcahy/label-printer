DEB_PACKAGE_NAME=label-printer
VERSION_STRING=0.0.1
DEB_PACKAGE_DESCRIPTION="label printer"
      #--prefix /usr/bin \
fpm --output-type deb \
   -a armhf \
      --input-type dir \
      --name label-printer \
      --version $VERSION_STRING \
      --description '${DEB_PACKAGE_DESCRIPTION}' \
      --deb-systemd label-printer.service \
      -p ${DEB_PACKAGE_NAME}-${VERSION_STRING}.deb \
      label-printer=/usr/bin/label-printer ui/build/=/usr/share/label-printer/ui \
