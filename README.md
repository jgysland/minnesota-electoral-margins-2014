# minnesota-electoral-margins-2014

## How did the DFL win every statewide race but lose the state house? House candidates underperformed statewide candidates.

This is a map of precinct-level differences in vote share between the DFL's statewide candidates (Senator Franken, Governor Dayton, and the other constitutional officers) and the DFL's candidates for the Minnesota House of Representatives. In bluer precincts, legislative candidates over-performed the statewide candidates; in oranger precincts, legislative candidates underperformed the statewide candidates. Each precinct has opacity set according to the number of votes cast in it relative to the rest of the state.

## Usage

Clone this repo, `cd` into it, and run `python -m SimpleHTTPServer 8081` (or use your preferred web-hosting package). Then just point your browser at [http://localhost:8081/]().

## To-Do

* Add a more descriptive blurb explaining the map.
* Add a (bivariate) legend showing the relationship between legislative-vs.-statewide over/under-performance and precinct vote total opacity.
* Improve TopoJSON compression for faster loading/rendering.

