# Dodoc

A self-hosted all-in-one collaborative tasks and notes app.

## Context

My "second brain" is spread across multiple apps. I want a one-stop solution that I can self-host, giving me full control over my data while still allowing collaboration with others. And while commercial solutions exist, I want to build it myself as practice and to fully meet my own needs and preferences.

OttaDo (in various forms) was my attempt at a local-only tasks app, but that was limited in capabilities.

Choretell was my attempt at a shared tasks app, but I'm not happy with all of my choices and want to start fresh.

This will probably not be the last in a long list of very similar apps I promptly abandon.

## Features

TODO

## Tech stack

This is mostly intended as a personal tool with no intention to host it as a public service, so I'm prioritizing my own development speed and preferences. That said, I do want it to be reasonably easy for others to self-host if they want to.

Frontend:

A somewhat standard SPA since I'm aiming for a native app-like experience, potentially with a PWA and/or Android app in the future, and SEO is not at all a concern.

* TypeScript - The measure twice, cut once web dev language.
* Vite - Pretty much the standard bundler for modern web apps. Trying out the Rolldown version since stakes are low.
* solit-html - My own UI rendering library that is very similar to SolidJS but leans on lit-html and my own DX preferences.
* Ionic web components - A very mature web components library. I'm using overrides with the Material Design 3 design system, which I like the look of.

Backend:

* Pocketbase - An open source BaaS and framework library written in Go and using a SQLite database. Vastly simplifies backend development for me. Using it as a framework with a slightly custom server executable to embed the frontend SPA for a truly all-in-one binary.

## Install

TODO
