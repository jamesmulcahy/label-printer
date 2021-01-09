package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

const PrintQueue = "dymo2" // "DYMO_LabelWriter_450"

// spaHandler implements the http.Handler interface, so we can use it
// to respond to HTTP requests. The path to the static directory and
// path to the index file within that static directory are used to
// serve the SPA in the given static directory.
type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/printLabel", printLabel)

	spa := spaHandler{staticPath: "ui/build", indexPath: "index.html"}
	r.PathPrefix("/").Handler(spa)

	http.Handle("/", r)
	err := http.ListenAndServe(":7071", nil)
	if err != nil {
		fmt.Printf("Couldn't ListenAndServe")
		os.Exit(1)
	}
}

type Row struct {
	Text  string `json:"text"`
	Count int    `json:"count"`
}

func printLabel(respWriter http.ResponseWriter, req *http.Request) {
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Printf("err: %+v\n", err)
		respWriter.WriteHeader(500)
		return
	}

	rows := map[string]*Row{}

	err = json.Unmarshal(body, &rows)

	if err != nil {
		fmt.Printf("err: %+v body: %s\n", err, string(body))
		respWriter.WriteHeader(500)
		return
	}

	for _, row := range rows {
		if row.Count > 0 {
			fmt.Printf("Printing %d labels with text: %s\n\n", row.Count, row.Text)
			err := spoolJob(row.Text, row.Count)
			if err != nil {
				respWriter.WriteHeader(500)
				fmt.Printf("Error printing %s	\n", row.Text)
				return
			}
			fmt.Printf("Print successful")
		}
	}
}

func spoolJob(text string, copies int) error {
	cmd := exec.Command("/usr/bin/lpr",
		fmt.Sprintf("-#%d", copies),
		"-P",
		PrintQueue,
		"-o",
		"PageSize=w72h108",
		"-o",
		"orientation-requested=5",
		"-o",
		"cpu=5",
		"-o",
		"lpi=3")

	ioWriterCloser, err := cmd.StdinPipe()

	if err != nil {
		return fmt.Errorf("couldn't open stdin pipe: %+v", err)
	}

	written, err := ioWriterCloser.Write([]byte(text))

	if written != len(text) {
		return errors.New("didn't write all text") // Handle this case
	}

	err = ioWriterCloser.Close()
	if err != nil {
		return errors.New("couldn't close stdin") // Handle this case
	}

	err = cmd.Start()

	if err != nil {
		return fmt.Errorf("Couldn't start command: %+v", err)
	}

	fmt.Printf("Waiting for lpr to complete...\n")
	err = cmd.Wait()

	if err != nil {
		return fmt.Errorf("Wait failure: %+v", err)
	}

	fmt.Printf("lpr executed successfully\n")
	return nil
}
