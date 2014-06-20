INCLUDES = -I$(shell pg_config --includedir)
LIBPATH = -L $(shell pg_config --libdir)
CFLAGS += $(INCLUDES) -g
LDFLAGS += -g
LDLIBS += $(LIBPATH) -lecpg -lpq

.SUFFIXES: .pgc,.pc

.pgc.c:
	ecpg -c $(INCLUDES) $?

.pc.c:
	ecpg -C PROC -c $(INCLUDES) $?

all:
	$(ECPG) -C 