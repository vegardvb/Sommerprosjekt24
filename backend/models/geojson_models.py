"""
This module provides classes for working with GeoJSON geometries and features.
"""

import os
import sys
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


# Imports the root directory to the path in order to import project modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)


# Base Geometry class
class Geometry(BaseModel):
    """
    Base class for representing geometric objects.
    """

    type: str
    coordinates: Any

    @property
    def __geo_interface__(self):
        return {"type": self.type, "coordinates": self.coordinates}


# Specific Geometry Types
class Point(Geometry):
    """
    Represents a point geometry.
    """

    type: str = "Point"
    coordinates: List[float]


class LineString(Geometry):
    """
    Represents a line string geometry.
    """

    type: str = "LineString"
    coordinates: List[List[float]]


class Polygon(Geometry):
    """
    Represents a polygon geometry.
    """

    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class MultiPoint(Geometry):
    """
    Represents a multi-point geometry.
    """

    type: str = "MultiPoint"
    coordinates: List[List[float]]


class MultiLineString(Geometry):
    """
    Represents a multi-line string geometry.
    """

    type: str = "MultiLineString"
    coordinates: List[List[List[float]]]


class MultiPolygon(Geometry):
    """
    Represents a multi-polygon geometry.
    """

    type: str = "MultiPolygon"
    coordinates: List[List[List[List[float]]]]


class Feature(BaseModel):
    """
    Represents a feature in a GeoJSON object.
    """

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
    """
    Represents a collection of features in a GeoJSON object.
    """

    type: str = "FeatureCollection"
    features: List[Feature]

    @property
    def __geo_interface__(self):
        return {
            "type": self.type,
            "features": [feature.__geo_interface__ for feature in self.features],
        }

# Pydantic model for the request body
class UpdateHeight(BaseModel):
    id: int
    hoyde: float