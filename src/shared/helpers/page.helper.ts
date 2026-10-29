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
import { ColumnI, ElementI } from '@shared/interfaces/page.interface.js';

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
  async function processElement(element: ElementI): Promise<void> {
    if (!element) return;

    element.dataText = [];
    for (const textRef of Object.keys(element.text ?? {})) {
      let findReference: ReferenceI[] | ReferenceReviewI[] | null = null;
      if (state === 'current') {
        findReference = await referenceRepository.get(element.text[textRef]);
      } else {
        findReference = await referenceRepository.getRefReview(
          element.text[textRef],
        );
      }

      findReference?.forEach((reference) => {
        element.dataText!.push({
          languageId: reference.languageId.toString(),
          [textRef]: reference.text,
        });
      });
    }

    if (Array.isArray(element.childrens)) {
      for (const children of element.childrens) {
        await processElement(children);
      }
    }
  }

  for (const section of content.data) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        if (column.element === null) continue;
        await processElement(column.element);
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
  async function processElement(element: ElementI): Promise<void> {
    if (!element || !element.dataText) {
      if (element?.childrens?.length) {
        for (const children of element.childrens) {
          await processElement(children);
        }
      }
      return;
    }

    const textRefs = Object.keys(element.text ?? {});
    for (const textRef of textRefs) {
      const findReference = await referenceRepository.getRefReview(
        element.text[textRef],
      );

      if (findReference.length === 0) {
        element.text[textRef] = randomCharacters('COMBINED', 16);
      }
    }

    for (const language of element.dataText) {
      const updatePromises = Object.keys(language)
        .filter((key) => key !== 'languageId')
        .map((key) =>
          createOrUpdateRef(
            key,
            element,
            language,
            entityId,
            typeReview,
            referenceRepository,
            cnx,
          ),
        );

      await Promise.all(updatePromises);
    }

    delete element.dataText;

    if (element.childrens?.length) {
      for (const children of element.childrens) {
        await processElement(children);
      }
    }
  }

  for (const section of content.data) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        if (!column.element) continue;
        await processElement(column.element);
      }
    }
  }
  return content;
}

async function createOrUpdateRef(
  key: string,
  element: ElementI,
  language: ElementDataI,
  entityId: number,
  typeReview: TypeReviewT,
  referenceRepository: ReferenceRepository,
  cnx: EntityManager,
) {
  const findReferenceLanguage = await referenceRepository.findRefReview(
    element.text[key],
    Number(language['languageId']),
    typeReview,
    entityId,
  );

  const createOrUpdateRef = {
    languageId: Number(language['languageId']),
    ref: element.text[key],
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

  return element;
}
