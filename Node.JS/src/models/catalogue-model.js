'use strict';

import { categories, sites } from '../shared/constansts';
import { conn } from '../../app';
import { isArray } from 'util';

const SELECT_PROPERTIES_QUERY_PART = `SELECT seller, address, discount_rate, description`;
const INNER_JOIN_QUERY_PART = `FROM catalogue INNER JOIN category ON catalogue.category_id = category.id INNER JOIN site ON catalogue.site_id = site.id`;
const ACTIVE_AND_VALID_QUERY_PART = `active = 1 AND (valid_from <= DATE(NOW()) OR valid_from IS NULL) AND (valid_till >= DATE(NOW()) OR valid_till IS NULL)`;

export default class Catalogue {
    constructor(catalogueItem) {
        this.seller = catalogueItem.seller;
        this.categoryId = categories.indexOf(catalogueItem.category);
        this.siteId = sites.indexOf(catalogueItem.site.toUpperCase());
        this.address = catalogueItem.address;
        this.discountRate = catalogueItem.discountRate;
        this.validFrom = new Date(catalogueItem.validFrom);
        this.validTill =
            this.validFrom < new Date(catalogueItem.validTill)
                ? new Date(catalogueItem.validTill)
                : new Date(2099, 12, 31);
        this.active = catalogueItem.active ? 1 : 0;
        this.description = catalogueItem.description;
    }

    static addCatalogueItem(newItem, res) {
        conn.query(
            'INSERT INTO `catalogue` (`seller`, `category_id`, `site_id`, `address`, `discount_rate`, `valid_from`, `valid_till`, `active`, `description`) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                newItem.seller,
                newItem.categoryId,
                newItem.siteId,
                newItem.address,
                newItem.discountRate,
                newItem.validFrom,
                newItem.validTill,
                newItem.active,
                newItem.description,
            ],
            function(err, response) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, response.insertId);
                }
            }
        );
    }

    static getCatalogueItemsBySiteName(siteName, res) {
        conn.query(
            `${SELECT_PROPERTIES_QUERY_PART}, site.name AS site_name
                ${INNER_JOIN_QUERY_PART}
                WHERE site.name = ? AND ${ACTIVE_AND_VALID_QUERY_PART}`,
            [siteName.toUpperCase()],
            function(err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static getCatalogueItemsByCategoryName(categoryName, res) {
        conn.query(
            `${SELECT_PROPERTIES_QUERY_PART}, site.name AS site_name
                ${INNER_JOIN_QUERY_PART}
                WHERE category.name = ? AND ${ACTIVE_AND_VALID_QUERY_PART}`,
            [categoryName],
            function(err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static filterCatalogueByCustomConditions(siteIds, categoryIds, res) {
        let query = `${SELECT_PROPERTIES_QUERY_PART}, category.name AS category_id, site.name AS site_id ${INNER_JOIN_QUERY_PART} WHERE `;
        let filterQueries = [];

        if (siteIds && siteIds.length !== 0) {
            let definedSiteIDs = [];

            for (let i = 0; i < siteIds.length; i++) {
                if (siteIds[i] !== null && !isNaN(siteIds[i])) {
                    definedSiteIDs.push(siteIds[i]);
                }
            }
            if (definedSiteIDs.length !== 0) {
                filterQueries.push(
                    'site.id IN (' + definedSiteIDs.join(', ') + ')'
                );
            }
        }

        if (categoryIds && categoryIds.length !== 0) {
            let definedCategoryIDs = [];

            for (let j = 0; j < categoryIds.length; j++) {
                if (categoryIds[j] !== null && !isNaN(categoryIds[j])) {
                    definedCategoryIDs.push(categoryIds[j]);
                }
            }

            if (definedCategoryIDs.length !== 0) {
                filterQueries.push(
                    'category.id IN (' + definedCategoryIDs.join(', ') + ')'
                );
            }
        }

        if (filterQueries.length !== 0) {
            query += '(' + filterQueries.join(' AND ') + ')' + ' AND ';
        }

        query += ACTIVE_AND_VALID_QUERY_PART;

        conn.query(query, [], function(err, result) {
            if (err) {
                console.log('Error: ', err);
                res(err, null);
            } else {
                res(null, result);
            }
        });
    }

    static getAllCatalogueItems(res) {
        conn.query(
            `${SELECT_PROPERTIES_QUERY_PART}, category.name AS category_name, site.name AS site_name
                ${INNER_JOIN_QUERY_PART}
                WHERE ${ACTIVE_AND_VALID_QUERY_PART}`,
            [],
            function(err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static modifyCatalogueItemById(id, modifiedUser, res) {
        conn.query(
            'UPDATE catalogue SET seller = ?, category_id = ?, site_id = ?, address = ?, discount_rate = ?, valid_from = ?, valid_till = ?, active = ?, description = ? ' +
                ' WHERE id = ?',
            [
                modifiedUser.seller,
                modifiedUser.categoryId,
                modifiedUser.siteId,
                modifiedUser.address,
                modifiedUser.discountRate,
                modifiedUser.validFrom,
                modifiedUser.validTill,
                modifiedUser.active,
                modifiedUser.description,
                id,
            ],
            function(err, response) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, response);
                }
            }
        );
    }

    static deleteCatalogueItemById(id, res) {
        conn.query(
            'UPDATE catalogue SET active = 0 WHERE id = ?',
            [id],
            function(err, result) {
                if (err) {
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static fetchCategoryList(res) {
        conn.query(`SELECT * FROM category ORDER BY id`, [], function(
            err,
            categoryResult
        ) {
            if (err) {
                console.log('Error: ', err);
                res(err, null);
            } else {
                for (let i = 0; i < categoryResult.length; i++) {
                    categories[i + 1] = categoryResult[i]['name'];
                }
                res(null, categoryResult);
            }
        });
    }
}
