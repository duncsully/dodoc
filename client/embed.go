package client

import (
	"embed"
	"io/fs"
)

//go:embed dist/**
var distDir embed.FS

var DistDirFS, _ = fs.Sub(distDir, "dist")
