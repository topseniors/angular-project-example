
#npm install

ng build --base-href ./ --env=prod

IMG_NAME="ui_local"

docker stop $IMG_NAME
docker rm $IMG_NAME
docker rmi -f $IMG_NAME
docker build -t $IMG_NAME .
docker run -p 80:80 --name ui_local -d ui_local
docker ps


