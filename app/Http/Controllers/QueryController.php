<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QueryController extends Controller
{   
    public function submit(Request $request)
    {   
        // Close session immediately to avoid blocking concurrent requests with session lock
        session_write_close();

        $request->headers->set('Accept', 'application/json'); // forces JSON output

        // $query = $request->input('query'); // ['type', 'county', 'district', 'season']
        // if (!$query || count($query) < 4) {
        //     return response()->json(['error' => 'Invalid query parameters'], 400);
        // }

        // [$queryType, $county, $district, $season] = $query;
        $queryType = $request->input('query') ?? null;
        $county    = $request->input('county') ?? null;
        $district  = $request->input('district') ?? null;
        $season    = $request->input('season') ?? null;

        // // 🔧 Build dynamic query based on input
        // $county = $request->input('county', '---');
        // $district = $request->input('district', '---');
        // $season = $request->input('season', '---');
        // $queryType = $request->input('queryType', 'Best Seller');

        // Prepare Season Filter
        $seasonFilter = null;
        if ($season !== 0) {
            switch ($season) {
                case 'Q1':
                    $seasonFilter = "EXTRACT(MONTH FROM TO_TIMESTAMP(actual_shipping_time, 'YYYY-MM-DD HH24:MI:SS')) < 4";
                    break;
                case 'Q2':
                    $seasonFilter = "EXTRACT(MONTH FROM TO_TIMESTAMP(actual_shipping_time, 'YYYY-MM-DD HH24:MI:SS')) BETWEEN 4 AND 6";
                    break;
                case 'Q3':
                    $seasonFilter = "EXTRACT(MONTH FROM TO_TIMESTAMP(actual_shipping_time, 'YYYY-MM-DD HH24:MI:SS')) BETWEEN 7 AND 9";
                    break;
                case 'Q4':
                    $seasonFilter = "EXTRACT(MONTH FROM TO_TIMESTAMP(actual_shipping_time, 'YYYY-MM-DD HH24:MI:SS')) BETWEEN 10 AND 12";
                    break;
            }
        }

        // Route based on queryType
        if ($queryType === "Best Seller") {
            return $this->getBestSeller($county, $district, $seasonFilter);
        }

        if ($queryType === "Top Category") {
            return $this->getTopCategory($county, $district, $season);
        }

        if ($queryType === "Best Logistics Cetner Location") {
            return $this->getBestLogisticsLocation($county, $district);
        }

        return response()->json(['error' => 'Invalid queryType'], 400);

    }

    private function getBestSeller($county, $district, $seasonFilter)
    {
        $baseQuery = DB::table('order_combined_pd as od')
            ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id')
            ->select('od.product_id', 'product_name', 'arrival_address_normalized', 'od.lat', 'od.long', DB::raw('count(*)'))
            ->where('arrival_address_normalized', 'ILIKE', "%{$county}%");

        if ($district !== 0) {
            $baseQuery->where('arrival_address_normalized', 'ILIKE', "%{$district}%");
        }

        if ($seasonFilter) {
            $baseQuery->whereRaw($seasonFilter);
        }

        $subQuery = clone $baseQuery;
        $subQuery->select('od.product_id')
            ->groupBy('od.product_id')
            ->orderByRaw('count(*) DESC')
            ->limit(1);

        $baseQuery->whereIn('od.product_id', $subQuery)
            ->groupBy('od.product_id', 'product_name', 'arrival_address_normalized', 'od.lat', 'od.long');

        $result = $baseQuery->get();

        if (empty($result)) {
            return response()->json([
                'message' => 'No results found',
                'data' => [],
            ], 200);
        }
    
        $fields = array_keys((array)$result[0]);
        $rows = array_map(fn($r) => array_values((array)$r), $result->toArray());
        
        return response()->json([
            'fields' => $fields,
            'rows' => $rows
        ], 200);
    }

    private function getTopCategory($county, $district, $season)
    {
        $tableSuffix = '';
        if ($season !== 0) {
            $tableSuffix = '_' . strtolower($season);
        }

        if ($district === 0) {
            $category = DB::table("prodcut_category_rank_by_county{$tableSuffix}")
                ->where('countyname', $county)
                ->value('primary_category');
        } else {
            $category = DB::table("prodcut_category_rank_by_district{$tableSuffix}")
                ->where('countyname', $county)
                ->where('townname', $district)
                ->value('primary_category');
        }

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $query = DB::table('order_combined_pd as od')
            ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id')
            ->select('rg_id', 'rm_id', 'rs_id', 'od.product_id', 'product_name', 'primary_category', 'arrival_address_normalized', 'lat', 'long')
            ->where('pd.primary_category', $category)
            ->where('arrival_address_normalized', 'ILIKE', "%{$county}%");

        if ($district !== 0) {
            $query->where('arrival_address_normalized', 'ILIKE', "%{$district}%");
        }

        $result = $query->get();

        if ($result->isEmpty()) {
            return response()->json([
                'fields' => [],
                'rows' => []
            ]);
        }

        // Safely get field names from the first result
        $fields = array_keys((array) $result[0]);

        // Convert each row (stdClass) to indexed array
        $rows = $result->map(function ($row) {
            return array_values((array) $row);
        })->toArray();

        return response()->json([
            'fields' => $fields,
            'rows' => $rows
        ]);
    }

    private function getBestLogisticsLocation($county, $district)
    {
        if ($district === 0) {
            $query = "
                WITH points_collection AS (
                    SELECT ST_Collect(dump_geom) AS geoms FROM (
                        SELECT od.geom AS dump_geom
                        FROM order_combined AS od 
                        WHERE strpos(od.arrival_address_normalized, ?) > 0
                        UNION
                        SELECT geom
                        FROM supplier 
                        WHERE strpos(supplier_address_normalized, ?) > 0
                    ) combined
                )
                SELECT ST_Y(ST_GeometricMedian(geoms)) AS lat, ST_X(ST_GeometricMedian(geoms)) AS long
                FROM points_collection;
            ";
            $result = DB::select($query, [$county, $county]);
            
        } else {
            $query = "
                WITH points_collection AS (
                    SELECT ST_Collect(dump_geom) AS geoms
                    FROM (
                        SELECT od.geom AS dump_geom
                        FROM order_combined AS od, town_moi_1111118 AS district
                        WHERE ST_Within(od.geom, district.geom)
                          AND district.countyname = ?
                          AND district.townname = ?
                        UNION
                        SELECT supplier.geom
                        FROM supplier, town_moi_1111118 AS district
                        WHERE ST_Within(supplier.geom, district.geom)
                          AND district.countyname = ?
                          AND district.townname = ?
                    ) combined
                )
                SELECT ST_Y(ST_GeometricMedian(geoms)) AS lat, ST_X(ST_GeometricMedian(geoms)) AS long
                FROM points_collection;
            ";
            $result = DB::select($query, [$county, $district, $county, $district]);
        }
        
        $fields = array_keys((array) $result[0]); // get column names from the first row
        $rows = array_map(function ($row) {
            return array_values((array) $row); // convert stdClass to indexed array
        }, $result);

        return response()->json([
            'fields' => $fields,
            'rows' => $rows
        ]);

    }
    
    
    public function search(Request $request)
    {
        // Close session immediately to avoid blocking concurrent requests with session lock
        session_write_close();

        $searchText = $request->input('searchText');
        $perPage = $request->input('perPage', 2000);

        try{
            // Initial query builder base
            $baseQuery = DB::table('order_combined_pd as od')
                ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id');

            $paginator = null;

            if (is_numeric($searchText)) {
                
                // Search by product_id
                $query = (clone $baseQuery)->select('od.product_id', 'product_name', 'rm_id', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                    ->where('od.product_id', $searchText);
                $p = $query->paginate($perPage);
                if ($p->isNotEmpty()) $paginator = $p;

                if (!$paginator) {
                    
                    // Search by primary_category
                    $query = (clone $baseQuery)->select('primary_category', 'od.product_id', 'product_name', 'rm_id', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('primary_category', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }

                if (!$paginator) {
                    
                    // Search by rg_id
                    $query = (clone $baseQuery)->select('rg_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rg_id', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }
            } else {
                
                // Search by product_name using strpos equivalent
                $query = (clone $baseQuery)->select('product_name', 'od.product_id', 'customer_id', 'rm_id',  'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                    ->whereRaw("strpos(product_name, ?) > 0", [$searchText]);
                
                $p = $query->paginate($perPage);
                if ($p->isNotEmpty()) $paginator = $p;
                
                    
                if (!$paginator) {
                    // Search by customer_id
                    $query = (clone $baseQuery)->select('customer_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('customer_id', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }

                if (!$paginator) {
                    
                    // Search by rs_id
                    $query = (clone $baseQuery)->select('rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rs_id', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }

                if (!$paginator) {
                 
                    // Search by rm_id
                    $query = (clone $baseQuery)->select('rm_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rm_id', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }

                if (!$paginator) {
                    
                    // Search by address
                    $query = (clone $baseQuery)->select('rm_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('arrival_address_normalized', $searchText);
                    $p = $query->paginate($perPage);
                    if ($p->isNotEmpty()) $paginator = $p;
                }
            }
            
            if (!$paginator) {
                return response()->json([
                    'message' => 'No results found',
                    'data' => [],
                    'fields' => [],
                    'rows' => []
                ], 200);
            }
        
            $items = $paginator->items();
            $fields = array_keys((array)$items[0]);
            $rows = array_map(fn($r) => array_values((array)$r), $items);
        
            return response()->json([
                'fields' => $fields,
                'rows' => $rows,
                'pagination' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                ]
            ], 200);

        } catch (\Exception $e) {
            logger()->error('Search error: ' . $e->getMessage());
        
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage(),
                'code' => $e->getCode()
            ], 500);
        }
    }

}
