# -*- coding: utf-8 -*-
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#
#  Author: Mauro Soria

from queue import Queue
import json
import socket
import threading

from ...lib.connection.RequestException import RequestException
from .Path import *
from .Scanner import *


class Fuzzer(object):

    def __init__(
        self,
        requester,
        dictionary,
        testFailPath=None,
        threads=1,
        matchCallbacks=[],
        notFoundCallbacks=[],
        errorCallbacks=[],
        socket=None
    ):

        self.requester = requester
        self.dictionary = dictionary
        self.testFailPath = testFailPath
        self.basePath = self.requester.basePath
        self.threads = []
        self.threads_count = threads if len(
            self.dictionary
        ) >= threads else len(self.dictionary)
        self.running = False
        self.scanners = {}
        self.defaultScanner = None
        self.matchCallbacks = matchCallbacks
        self.notFoundCallbacks = notFoundCallbacks
        self.errorCallbacks = errorCallbacks
        self.socket = socket

        self.matches = []
        self.errors = []
        self.counter = 0

        self.timeout_counter = 0


        self.found_data = False

    def wait(self, timeout=None):
        for thread in self.threads:
            thread.join(timeout)
            if timeout is not None and thread.is_alive():
                return False
        return True

    def setupScanners(self):
        if len(self.scanners) != 0:
            self.scanners = {}
        self.defaultScanner = Scanner(self.requester, self.testFailPath, "")
        self.scanners['/'] = Scanner(self.requester, self.testFailPath, "/")
        for extension in self.dictionary.extensions:
            self.scanners[extension] = Scanner(
                self.requester, self.testFailPath, "." + extension
            )

    def setupThreads(self):
        if len(self.threads) != 0:
            self.threads = []
        for thread in range(self.threads_count):
            newThread = threading.Thread(target=self.thread_proc)
            newThread.daemon = True
            self.threads.append(newThread)

    def getScannerFor(self, path):
        if path.endswith('/'):
            return self.scanners['/']
        for extension in list(self.scanners.keys()):
            if path.endswith(extension):
                return self.scanners[extension]
        # By default, returns empty tester
        return self.defaultScanner

    def start(self):
        try:
            # Setting up testers
            self.setupScanners()
        except Exception as exc:
            print("setupScanners threw an exception", str(exc))
            return
        # Setting up threads
        self.setupThreads()
        self.index = 0
        self.dictionary.reset()
        self.runningThreadsCount = len(self.threads)
        self.running = True
        self.playEvent = threading.Event()
        self.pausedSemaphore = threading.Semaphore(0)
        self.playEvent.clear()
        self.exit = False
        for thread in self.threads:
            thread.start()
        self.play()

    def play(self):
        self.playEvent.set()

    def pause(self):
        self.playEvent.clear()
        for thread in self.threads:
            if thread.is_alive():
                self.pausedSemaphore.acquire()

    def stop(self):
        self.running = False
        self.play()

    def scan(self, path):
        response = self.requester.request(path)
        result = None
        if self.getScannerFor(path).scan(path, response):
            result = (None if response.status == 404 else response.status)
        return result, response

    def isRunning(self):
        return self.running

    def finishThreads(self):
        self.running = False
        self.finishedEvent.set()

    def isFinished(self):
        return self.runningThreadsCount == 0

    def stopThread(self):
        self.runningThreadsCount -= 1

    def thread_proc(self):
        self.playEvent.wait()
        try:
            path = next(self.dictionary)
            while path is not None:
                if self.counter % 50 == 0 and self.counter / 50 > 0:
                    # print(self.requester.url, "progress= ", int(float(self.counter) / float(len(self.dictionary)) * 100),self.socket,bytes(json.dumps({"status":'Working', "progress":int(float(self.counter) / float(len(self.dictionary)) * 100)}), 'utf-8'))
                    self.socket.sendall(
                        bytes(
                            json.dumps(
                                {
                                    "status":
                                        'Working',
                                    "progress":
                                        int(
                                            float(self.counter) /
                                            float(len(self.dictionary)) * 100
                                        ),
                                    "new_data": self.found_data
                                }
                            ) + "SPLITHERE", 'utf-8'
                        )
                    )
                    self.found_data = False
                try:
                    status, response = self.scan(path)
                    result = Path(path=path, status=status, response=response)
                    if status is not None:
                        self.matches.append(result)
                        self.found_data = True
                        for callback in self.matchCallbacks:
                            callback(result)
                    else:
                        for callback in self.notFoundCallbacks:
                            callback(result)

                    self.timeout_counter = 0

                    del status
                    del response
                except RequestException as e:
                    self.counter += 1
                    self.timeout_counter += 1
                    # print(self.requester.url, "timeout in fuzzer", self.timeout_counter)
                    for callback in self.errorCallbacks:
                        callback(path, e.args[0]['message'])
                    continue
                finally:
                    if self.timeout_counter > 15:
                        raise StopIteration()

                    self.counter += 1
                    if not self.playEvent.isSet():
                        self.pausedSemaphore.release()
                        self.playEvent.wait()
                    path = next(
                        self.dictionary
                    )  # Raises StopIteration when finishes
                    if not self.running:
                        break
        except StopIteration:
            return
        finally:
            self.stopThread()
