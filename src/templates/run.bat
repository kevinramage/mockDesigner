REM @ECHO OFF
for /f "delims=" %%i in ('"docker ps -a --filter=name=generated_was --format \"{{.ID}}\""') do SET CONTAINER_ID=%%i
IF DEFINED CONTAINER_ID (
	docker rm %CONTAINER_ID%
)
for /f "delims=" %%i in ('"docker images --filter reference=generated_was --format \"{{.ID}}\""') do SET IMAGE_ID=%%i
IF DEFINED IMAGE_ID (
	docker rmi %IMAGE_ID%
)
docker-compose up -d