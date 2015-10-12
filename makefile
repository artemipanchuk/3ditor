fetch = find . -name

clean:
	rm $(shell find server/classes -name "*.js") 2> /dev/null
	rm $(shell find client/classes -name "*.js") 2> /dev/null
