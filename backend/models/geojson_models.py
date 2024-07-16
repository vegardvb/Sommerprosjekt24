from pydantic import BaseModel
from typing import List, Dict, Any, Optional


# Base Geometry class
class Geometry(BaseModel):
    type: str
    coordinates: Any

    @property
    def __geo_interface__(self):
        return {"type": self.type, "coordinates": self.coordinates}


# Specific Geometry Types
class Point(Geometry):
    type: str = "Point"
    coordinates: List[float]


class LineString(Geometry):
    type: str = "LineString"
    coordinates: List[List[float]]


class Polygon(Geometry):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class MultiPoint(Geometry):
    type: str = "MultiPoint"
    coordinates: List[List[float]]


class MultiLineString(Geometry):
    type: str = "MultiLineString"
    coordinates: List[List[List[float]]]


class MultiPolygon(Geometry):
    type: str = "MultiPolygon"
    coordinates: List[List[List[List[float]]]]


class Feature(BaseModel):
    type: str = "Feature"
    geometry: Geometry
    properties: Optional[Dict[str, Any]] = None

    @property
    def __geo_interface__(self):
        return {
            "type": self.type,
            "geometry": self.geometry.__geo_interface__,
            "properties": self.properties or {},
        }


class FeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[Feature]

    @property
    def __geo_interface__(self):
        return {
            "type": self.type,
            "features": [feature.__geo_interface__ for feature in self.features],
        }
