

const adv_result = (module,populate) => async (req,res,next) => {
        let query;
        // ვაკოპირებ რომ select ქუერი მთლიანად ამოვშალო და ვეძებო დანარჩენი რაც ქუერიში წერია
        // რადგან query აიღიქვამს მაგ: select=name როგორც (housing=true რომელიც მონაცემთაბაზაშია , ჩვეულებრივი ოპცია)
        let reqQuery = {...req.query};
        console.log(req.query);

        const removefields = ['select','sort','page','limit'];

        removefields.forEach(el => delete reqQuery[el]);

        // მონგუსის ოპერატორები იწყება ყოველთვის $ ნიშნით
        let querystr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // დანარჩენი ქუერი მონაცემებით ვაბრუნებ შესაბამის bootcamps , სელექთი არის წაშლილი
        query = module.find(JSON.parse(querystr));

        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');

            // აქ კი მონგუსის მეთოდით query.select('ფილტროფცია1 ფილტროფცია2') ვსორტავთ მოძებნილ ბანაკებს
            query.select(fields);
        }

        if(req.query.sort) {
            const fields = req.query.select.split(',').join(' ');

            query.sort(fields);
        }else{
            query.sort('-createdAt');
        }

        //pagination
        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 25;
        const startidx = (page-1)*limit;
        const endidx = page*limit;
        const total = await module.countDocuments();

        query.skip(startidx).limit(limit);

        if(populate) {
            query.populate(populate);
        }

        let pagination = {};

        if(startidx > 0) { 
            pagination.prev = page-1;
            pagination.limit = limit;
        }
        if(endidx < total) {
            pagination.next = page+1;
            pagination.limit = limit;
        }

        const results = await query;

        res.advanceresults = {
            success: true,
            pagination,
            count: total,
            data: results
        }

        next();
}

module.exports = adv_result;