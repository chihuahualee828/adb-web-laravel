<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChartController extends Controller {

    public function getPieChartData(Request $request) {
        $searchText = $request->input('searchText');
        $searchBy   = $request->input('searchhBy');
        $groupBy    = $request->input('groupBy');
        $county     = $request->input('county');

        $fieldMap = [
            'county'   => 'countyname',
            'district' => 'townname',
            'season'   => 'season',
        ];

        $labelField = $fieldMap[$groupBy] ?? null;
        if (!$labelField) {
            return response()->json(['error' => 'Invalid grouping'], 400);
        }

        // Base query with joins
        $query = DB::table('order_combined_pd as od')
            ->join('product_list_combined as pd', 'od.product_id', '=', 'pd.product_id');

        // Group-specific geometry joins
        if ($groupBy === 'county') {
            $query->join('county_moi_1090820 as geo', DB::raw('ST_Within(od.geom, geo.geom)'), '=', DB::raw('TRUE'));
        } elseif ($groupBy === 'district') {
            if ($county) {
                $query->join('town_moi_1111118 as geo', DB::raw('ST_Within(od.geom, geo.geom)'), '=', DB::raw('TRUE'));
                $query->where('geo.countyname', $county);
            } else   {
                $query->join('town_moi_1111118 as geo', DB::raw('ST_Within(od.geom, geo.geom)'), '=', DB::raw('TRUE'));
            }
        }

        // Search filtering
        if ($searchBy === 'product_id') {
            $query->where('od.product_id', $searchText);
        } elseif ($searchBy === 'primary_category') {
            $query->where('pd.primary_category', $searchText);
        } elseif ($searchBy === 'product_name') {
            $query->where('pd.product_name', 'ILIKE', '%' . $searchText . '%');
        }

        // Special case: group by season
        if ($groupBy === 'season') {
            $query->selectRaw("CEIL(EXTRACT(MONTH FROM TO_TIMESTAMP(order_time, 'YYYY-MM-DD HH24:MI:SS')) / 3) AS season")
                ->selectRaw("COUNT(*) as count")
                ->groupBy('season');
        } else {
            $query->select("geo.$labelField", DB::raw('COUNT(*) as count'))
                ->groupBy("geo.$labelField");
        }

        $results = $query->get();

        if ($results->isEmpty()) {
            return response()->json(['fields' => [], 'rows' => []]);
        }

        $fields = array_keys((array) $results[0]);
        $rows   = $results->map(fn($row) => array_values((array) $row));

        return response()->json([
            'fields' => $fields,
            'rows'   => $rows
        ]);
    }

}
