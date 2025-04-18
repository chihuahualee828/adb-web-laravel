<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QueryController extends Controller
{   
    public function submit(Request $request)
    {   
        $request->headers->set('Accept', 'application/json'); // forces JSON output

        $query = $request->input('query'); // ['type', 'county', 'district', 'season']
        // if (!$query || count($query) < 4) {
        //     return response()->json(['error' => 'Invalid query parameters'], 400);
        // }

        [$queryType, $county, $district, $season] = $query;

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
        // $tableSuffix = '';
        // if ($season !== 0) {
        //     $tableSuffix = "_$season";
        // }

        // if ($district === 0) {
        //     $category = DB::table("prodcut_category_rank_by_county{$tableSuffix}")
        //         ->where('countyname', $county)
        //         ->value('primary_category');
        // } else {
        //     $category = DB::table("prodcut_category_rank_by_district{$tableSuffix}")
        //         ->where('countyname', $county)
        //         ->where('townname', $district)
        //         ->value('primary_category');
        // }

        // if (!$category) {
        //     return response()->json(['error' => 'Category not found'], 404);
        // }

        // $query = DB::table('order_combined_pd as od')
        //     ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id')
        //     ->select('rg_id', 'rm_id', 'rs_id', 'od.product_id', 'product_name', 'primary_category', 'arrival_address_normalized', 'lat', 'long')
        //     ->where('pd.primary_category', $category)
        //     ->where('arrival_address_normalized', 'ILIKE', "%{$county}%");

        // if ($district !== 0) {
        //     $query->where('arrival_address_normalized', 'ILIKE', "%{$district}%");
        // }

        // return response()->json($query->get());
        $isDistrictAll = $district == 0;
        $isSeasonAll = $season == 0;

        $tableSuffix = $isSeasonAll ? '' : "_$season";

        $categoryTable = $isDistrictAll
            ? "prodcut_category_rank_by_county{$tableSuffix}"
            : "prodcut_category_rank_by_district{$tableSuffix}";

        // Fetch top category
        $categoryQuery = DB::table($categoryTable)->where('countyname', $county);
        if (!$isDistrictAll) {
            $categoryQuery->where('townname', $district);
        }

        $topCategory = $categoryQuery->value('primary_category');

        if (!$topCategory) {
            return response()->json(['error' => 'Top category not found'], 404);
        }

        // Build main query
        $query = DB::table('order_combined_pd as od')
            ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id')
            ->select(
                'rg_id', 'rm_id', 'rs_id',
                'od.product_id', 'product_name',
                'primary_category', 'arrival_address_normalized', 'lat', 'long'
            )
            ->where('pd.primary_category', $topCategory)
            ->where('arrival_address_normalized', 'ILIKE', "%{$county}%");

        if (!$isDistrictAll) {
            $query->where('arrival_address_normalized', 'ILIKE', "%{$district}%");
        }

        return response()->json($query->get());
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
        $searchText = $request->input('searchText');

        try{
            // Initial query builder base
            $baseQuery = DB::table('order_combined_pd as od')
                ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id');

            $result = [];

            if (is_numeric($searchText)) {
                $productQuery = clone $baseQuery;
                // Search by product_id
                $result = $productQuery->select('od.product_id', 'product_name', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                    ->where('od.product_id', $searchText)
                    ->get();

                if ($result->isEmpty()) {
                    $productQuery = clone $baseQuery;
                    // Search by primary_category
                    $result = $productQuery->select('primary_category', 'od.product_id', 'product_name', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('primary_category', $searchText)
                        ->get();
                }

                if ($result->isEmpty()) {
                    $productQuery = clone $baseQuery;
                    // Search by rg_id
                    $result = $productQuery->select('rg_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rg_id', $searchText)
                        ->get();
                }
            } else {
                // Search by product_name using strpos equivalent
                // $results = $baseQuery->select('product_name', 'od.product_id', 'customer_id', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                //     ->where('product_name', 'ILIKE', '%' . $searchText . '%')
                //     ->get();
                $productQuery = clone $baseQuery;
                $result = $productQuery->select('product_name', 'od.product_id', 'customer_id', 'rs_id', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                    ->whereRaw("strpos(product_name, ?) > 0", [$searchText])
                    ->get();
                    
                if ($result->isEmpty()) {
                    // Search by customer_id
                    $productQuery = clone $baseQuery;
                    $result = $productQuery->select('customer_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('customer_id', $searchText)
                        ->get();
                }

                if ($result->isEmpty()) {
                    $productQuery = clone $baseQuery;
                    // Search by rs_id
                    $result = $productQuery->select('rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rs_id', $searchText)
                        ->get();
                }

                if ($result->isEmpty()) {
                    $productQuery = clone $baseQuery;
                    // Search by rm_id
                    $result = $productQuery->select('rm_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('od.rm_id', $searchText)
                        ->get();
                }

                if ($result->isEmpty()) {
                    $productQuery = clone $baseQuery;
                    // Search by address
                    $result = $productQuery->select('rm_id', 'rs_id', 'od.product_id', 'product_name', 'arrival_address_normalized', 'order_time', 'od.lat', 'od.long')
                        ->where('arrival_address_normalized', $searchText)
                        ->get();
                }
            }
            
            // $users = result->paginate(15);
 
            // return view('user.index', ['users' => $users]);

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
