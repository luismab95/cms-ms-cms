import { stringToSlug, randomCharacters } from 'cms-lib-resources';
import { EntityManager, TypeReviewT } from 'cms-lib-database';
import { PageRepository } from '@modules/pages/repositories/page.repository.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import {
  CreatePageDto,
  ElementDataI,
  PageBodyI,
} from '@modules/pages/dto/page.dto.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { TemplateNestedObjectI } from '@modules/templates/dto/template.dto.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import {
  ReferenceI,
  ReferenceReviewI,
} from '@shared/interfaces/reference.interface.js';
import { ColumnI } from '@shared/interfaces/page.interface.js';

export async function createPage(
  createPageDto: CreatePageDto,
  cnx: EntityManager,
) {
  const pageRepository = new PageRepository();
  const languageRepository = new LanguageRepository();
  const referenceRepository = new ReferenceRepository();
  const sitieRepository = new SitieRepository();

  const sitie = await sitieRepository.find();
  createPageDto.sitieId = sitie?.id;

  createPageDto.path = stringToSlug(createPageDto.path);
  const newPage = await pageRepository.create(createPageDto, cnx);

  const languages = await languageRepository.get({
    limit: 99999,
    page: 1,
    search: null,
    status: true,
  });

  const aliasRef: string = randomCharacters('COMBINED', 16);
  const descriptionRef: string = randomCharacters('COMBINED', 16);
  const seoKeywordsRef: string = randomCharacters('COMBINED', 16);

  for (let language of languages.records) {
    await referenceRepository.create(
      {
        ref: aliasRef,
        languageId: language.id!,
        text: '',
        type: 'page',
        pageId: newPage.id,
        templateId: null,
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: descriptionRef,
        languageId: language.id!,
        text: '',
        type: 'page',
        pageId: newPage.id,
        templateId: null,
      },
      cnx,
    );
    await referenceRepository.create(
      {
        ref: seoKeywordsRef,
        languageId: language.id!,
        text: '',
        type: 'page',
        pageId: newPage.id,
        templateId: null,
      },
      cnx,
    );
  }

  await pageRepository.createDetails(
    {
      aliasRef,
      descriptionRef,
      seoKeywordsRef,
      pageId: newPage.id,
    },
    cnx,
  );

  return newPage;
}

export async function replaceRefText(
  content: TemplateNestedObjectI | PageBodyI,
  state: 'current' | 'review',
) {
  const referenceRepository = new ReferenceRepository();

  content = JSON.parse(JSON.stringify(content));
  for (const section of content.data) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        if (column.element === null) continue;
        const textRefs: string[] = [];
        Object.keys(column.element.text).forEach((key) => {
          textRefs.push(key);
        });
        column.element.dataText = [];
        for (const textRef of textRefs) {
          let findReference: ReferenceI[] | ReferenceReviewI[] | null = null;
          if (state === 'current') {
            findReference = await referenceRepository.get(
              column.element.text[textRef],
            );
          } else {
            findReference = await referenceRepository.getRefReview(
              column.element.text[textRef],
            );
          }
          findReference.forEach((reference) => {
            column.element.dataText?.push({
              languageId: reference.languageId.toString(),
              [textRef]: reference.text,
            });
          });
        }
      }
    }
  }

  return content;
}

export async function saveRefText(
  content: TemplateNestedObjectI | PageBodyI,
  entityId: number,
  typeReview: TypeReviewT,
  cnx: EntityManager,
) {
  const referenceRepository = new ReferenceRepository();

  content = JSON.parse(JSON.stringify(content));
  for (const section of content.data) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        if (column.element === null) continue;
        if (!column.element?.dataText) continue;
        const textRefs: string[] = [];
        Object.keys(column.element.text).forEach((key) => {
          textRefs.push(key);
        });
        for (const textRef of textRefs) {
          const findReference = await referenceRepository.getRefReview(
            column.element.text[textRef],
          );
          if (findReference.length === 0) {
            const ref = randomCharacters('COMBINED', 16);
            column.element.text[textRef] = ref;
          }
        }
        for (const language of column.element.dataText) {
          const updatePromises = Object.keys(language)
            .filter((key) => key !== 'languageId')
            .map((key) =>
              createOrUpdateRef(
                key,
                column,
                language,
                entityId,
                typeReview,
                referenceRepository,
                cnx,
              ),
            );

          await Promise.all(updatePromises);
        }
        delete column.element.dataText;
      }
    }
  }

  return content;
}

async function createOrUpdateRef(
  key: string,
  column: ColumnI,
  language: ElementDataI,
  entityId: number,
  typeReview: TypeReviewT,
  referenceRepository: ReferenceRepository,
  cnx: EntityManager,
) {
  const findReferenceLanguage = await referenceRepository.findRefReview(
    column.element.text[key],
    Number(language['languageId']),
    typeReview,
    entityId,
  );

  const createOrUpdateRef = {
    languageId: Number(language['languageId']),
    ref: column.element.text[key],
    text: language[key],
    type: typeReview,
    pageId: typeReview === 'page' ? entityId : null,
    templateId: typeReview === 'template' ? entityId : null,
  } as ReferenceReviewI;

  if (!findReferenceLanguage) {
    await referenceRepository.createRefReview(createOrUpdateRef, cnx);
  } else {
    await referenceRepository.updateRefReview(createOrUpdateRef, cnx);
  }

  return column;
}
