<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LayerController extends Controller
{
    public function getLayer(Request $request)
    {
        $layer = $request->input('layer');
        $query = '';

        if ($layer === 'layerCounty') {
            $query = "SELECT countyname, ST_AsGeoJSON(geom) FROM county_moi_1090820";
        } elseif ($layer === 'layerDistrict') {
            $query = "SELECT countyname, townname, ST_AsGeoJSON(geom) FROM town_moi_1111118";
        } else {
            return response()->json(['error' => 'Invalid layer'], 400);
        }

        $results = DB::select($query);

        if (empty($results)) {
            return response()->json([]);
        }

        // Build the response in format: [fields, ...rows]
        $fields = array_keys((array) $results[0]);
        $rows = array_map(fn($r) => array_values((array)$r), $results);

        return response()->json(array_merge([$fields], $rows), JSON_UNESCAPED_UNICODE);
    }
}
