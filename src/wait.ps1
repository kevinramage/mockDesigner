$TEST=$(docker ps -f name=$($args[0]) -f status=running --format "{{.ID}}")
WHILE (!($TEST -is "STRING")) {
	sleep 1
	$TEST=$(docker ps -f name=$($args[0]) -f status=running --format "{{.ID}}")
}
echo "Container: $TEST"
docker ps -a
WHILE ( $((docker logs $TEST | Select-String -Pattern "server started on" | Measure-Object -Line).Lines -eq 0)) {
	sleep 1
}
docker logs $TEST